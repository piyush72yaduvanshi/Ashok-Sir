import Food from "../models/Food.js";
import OrderBill from "../models/Order.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
const createDirectBill = async (req, res) => {
  try {
    const {
      orderType = "DINE_IN",
      paymentMethod,
      discount = 0,
      customerDetails,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = item.foodId
        ? await Food.findById(item.foodId)
        : await Food.findOne({
            name: { $regex: new RegExp(`^${item.foodName}$`, "i") },
          });

      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food not found: ${item.foodName || item.foodId}`,
        });
      }
      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Food item "${food.name}" is currently unavailable`,
        });
      }

      const quantity = item.quantity || 1;
      const price = food.price;
      const itemSubtotal = quantity * price;
      subtotal += itemSubtotal;

      orderItems.push({
        foodId: food._id,
        foodName: food.name,
        quantity,
        price,
        subtotal: itemSubtotal,
        specialInstructions: item.specialInstructions || null,
      });
    }

    const totalAmount = subtotal - discount;
    const billNumber = `BILL-${Date.now()}`;

    const newBill = new OrderBill({
      billNumber,
      orderType,
      subtotal,
      discount,
      totalAmount,
      paymentMethod,
      customerDetails,
      generatedBy: req.user._id,
      items: orderItems,
    });

    await newBill.save();

    res.status(201).json({
      success: true,
      message: "Bill created and saved successfully",
      data: newBill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBill = await OrderBill.findById(id);
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const {
      items,
      discount = existingBill.discount,
      paymentMethod = existingBill.paymentMethod,
      customerDetails = existingBill.customerDetails,
      orderType = existingBill.orderType,
    } = req.body;

    let subtotal = 0;
    let updatedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        let food;

        if (item.foodId) {
          food = await Food.findById(item.foodId);
        } else if (item.foodName) {
          food = await Food.findOne({
            name: { $regex: new RegExp(`^${item.foodName}$`, "i") },
          });
        }

        if (!food) {
          return res.status(404).json({
            success: false,
            message: `Food not found: ${item.foodName || item.foodId}`,
          });
        }
        if (!food.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Food item "${food.name}" is currently unavailable`,
          });
        }

        const quantity = item.quantity || 1;
        const price = food.price;
        const itemSubtotal = quantity * price;
        subtotal += itemSubtotal;

        updatedItems.push({
          foodId: food._id,
          foodName: food.name,
          quantity,
          price,
          subtotal: itemSubtotal,
          specialInstructions: item.specialInstructions || null,
        });
      }
    } else {
      updatedItems = existingBill.items;
      subtotal = existingBill.subtotal;
    }

    const totalAmount = subtotal - discount;

    existingBill.items = updatedItems;
    existingBill.subtotal = subtotal;
    existingBill.discount = discount;
    existingBill.totalAmount = totalAmount;
    existingBill.paymentMethod = paymentMethod;
    existingBill.customerDetails = customerDetails;
    existingBill.orderType = orderType;
    existingBill.updatedAt = new Date();

    await existingBill.save();

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: existingBill,
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await OrderBill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    await bill.deleteOne();

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
      data: {
        billNumber: bill.billNumber,
        totalAmount: bill.totalAmount,
        customer: bill.customerDetails.name,
      },
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
const getAllBills = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      paymentMethod,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== "SUPER_ADMIN") {
      filter.generatedBy = req.user._id;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod.toUpperCase();
    }

    if (startDate || endDate) {
      filter.paidAt = {};
      if (startDate) filter.paidAt.$gte = new Date(startDate);
      if (endDate) filter.paidAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { "customerDetails.name": { $regex: search, $options: "i" } },
        { "customerDetails.phone": { $regex: search, $options: "i" } },
      ];
    }

    const bills = await OrderBill.find(filter)
      .populate("generatedBy", "name email role")
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Bills fetched successfully",
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await OrderBill.findById(id).populate(
      "generatedBy",
      "name email role"
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bill fetched successfully",
      data: bill,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const downloadBillPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await OrderBill.findById(id).populate(
      "generatedBy",
      "name email"
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const qrData = {
      billNumber: bill.billNumber,
      date: new Date(bill.paidAt).toLocaleString(),
      orderType: bill.orderType,
      paymentMethod: bill.paymentMethod,
      totalAmount: bill.totalAmount,
      discount: bill.discount,
      subtotal: bill.subtotal,
      customerDetails: bill.customerDetails,
      items: bill.items.map((item) => ({
        foodName: item.foodName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      generatedBy: bill.generatedBy?.name,
    };

    // Generate QR Code (Base64)
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
    const qrImage = qrCodeDataURL.split(",")[1]; // remove data prefix
    const qrBuffer = Buffer.from(qrImage, "base64");

    // Create new PDF document
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${bill.billNumber}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Restaurant Billing System", 50, 50);
    doc.image(qrBuffer, 420, 40, { width: 100, height: 100 }); // QR at top-right corner

    doc.moveDown(4);

    doc.fontSize(14).text(`Bill No: ${bill.billNumber}`);
    doc.text(`Date: ${new Date(bill.paidAt).toLocaleString()}`);
    doc.text(`Order Type: ${bill.orderType}`);
    doc.text(`Payment Method: ${bill.paymentMethod}`);
    doc.moveDown(1);

    doc.fontSize(14).text("Customer Details:");
    doc.text(`Name: ${bill.customerDetails?.name || "-"}`);
    if (bill.customerDetails?.phone)
      doc.text(`Phone: ${bill.customerDetails.phone}`);
    doc.moveDown(1);

    doc.fontSize(14).text("Items:");
    doc.moveDown(0.3);

    doc.fontSize(12);
    doc.text("Item", 50);
    doc.text("Qty", 250);
    doc.text("Price", 320);
    doc.text("Subtotal", 420);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    bill.items.forEach((item) => {
      doc.text(item.foodName, 50);
      doc.text(item.quantity.toString(), 260);
      doc.text(`₹${item.price.toFixed(2)}`, 320);
      doc.text(`₹${item.subtotal.toFixed(2)}`, 420);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(0.5);
    doc.fontSize(12).text(`Subtotal: ₹${bill.subtotal.toFixed(2)}`, {
      align: "right",
    });
    doc.text(`Discount: ₹${bill.discount.toFixed(2)}`, { align: "right" });
    doc.text(`Total: ₹${bill.totalAmount.toFixed(2)}`, {
      align: "right",
      underline: true,
    });
    doc.moveDown(1.5);

    doc.fontSize(10).text(`Generated by: ${bill.generatedBy?.name}`, {
      align: "left",
    });
    doc.text("Thank you for visiting!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF bill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const downloadBillByNUmberPDF = async (req, res) => {
  try {
    const { billNumber } = req.body;

    const bill = await OrderBill.findOne({ billNumber }).populate(
      "generatedBy",
      "name email"
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const qrData = {
      billNumber: bill.billNumber,
      date: new Date(bill.paidAt).toLocaleString(),
      orderType: bill.orderType,
      paymentMethod: bill.paymentMethod,
      totalAmount: bill.totalAmount,
      discount: bill.discount,
      subtotal: bill.subtotal,
      customerDetails: bill.customerDetails,
      items: bill.items.map((item) => ({
        foodName: item.foodName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      generatedBy: bill.generatedBy?.name,
    };

    // Generate QR Code (Base64)
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
    const qrImage = qrCodeDataURL.split(",")[1]; // remove data prefix
    const qrBuffer = Buffer.from(qrImage, "base64");

    // Create new PDF document
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${bill.billNumber}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Restaurant Billing System", 50, 50);
    doc.image(qrBuffer, 420, 40, { width: 100, height: 100 }); // QR at top-right corner

    doc.moveDown(4);

    doc.fontSize(14).text(`Bill No: ${bill.billNumber}`);
    doc.text(`Date: ${new Date(bill.paidAt).toLocaleString()}`);
    doc.text(`Order Type: ${bill.orderType}`);
    doc.text(`Payment Method: ${bill.paymentMethod}`);
    doc.moveDown(1);

    doc.fontSize(14).text("Customer Details:");
    doc.text(`Name: ${bill.customerDetails?.name || "-"}`);
    if (bill.customerDetails?.phone)
      doc.text(`Phone: ${bill.customerDetails.phone}`);
    doc.moveDown(1);

    doc.fontSize(14).text("Items:");
    doc.moveDown(0.3);

    doc.fontSize(12);
    doc.text("Item", 50);
    doc.text("Qty", 250);
    doc.text("Price", 320);
    doc.text("Subtotal", 420);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    bill.items.forEach((item) => {
      doc.text(item.foodName, 50);
      doc.text(item.quantity.toString(), 260);
      doc.text(`₹${item.price.toFixed(2)}`, 320);
      doc.text(`₹${item.subtotal.toFixed(2)}`, 420);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(0.5);
    doc.fontSize(12).text(`Subtotal: ₹${bill.subtotal.toFixed(2)}`, {
      align: "right",
    });
    doc.text(`Discount: ₹${bill.discount.toFixed(2)}`, { align: "right" });
    doc.text(`Total: ₹${bill.totalAmount.toFixed(2)}`, {
      align: "right",
      underline: true,
    });
    doc.moveDown(1.5);

    doc.fontSize(10).text(`Generated by: ${bill.generatedBy?.name}`, {
      align: "left",
    });
    doc.text("Thank you for visiting!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF bill:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export {
  createDirectBill,
  updateBill,
  deleteBill,
  getAllBills,
  getBillById,
  downloadBillPDF,
  downloadBillByNUmberPDF
};
