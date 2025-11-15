import React, { useEffect, useState, useMemo, useRef } from "react";
import api from "../config/api";
import { motion } from "framer-motion";
import { usePDF } from "react-to-pdf";
import QRCode from "qrcode";



const categories = ["ALL", "STARTERS", "MAIN_COURSE", "DESSERTS", "BEVERAGES"];

const FoodBillingPOS = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [showOrder, setShowOrder] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [qrDataURL, setQrDataURL] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    discount: 0,
    orderType: "TAKEAWAY",
    paymentMethod: "CASH",
  });

  const { toPDF, targetRef } = usePDF({
    filename: "NCB_BILL_80mm.pdf",
  });

  const subtotal = useMemo(
    () => orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [orderItems]
  );
  const totalAmount = subtotal - (Number(customer.discount) || 0);

  // Fetch foods list
  const fetchFoods = async () => {
    try {
      setLoading(true);
      let endpoint = `/food/all-foods?page=1&limit=50`;
      if (category !== "ALL") endpoint += `&category=${category}`;
      if (isAvailable) endpoint += `&isAvailable=true`;
      if (search.trim() !== "") endpoint = `/food/all-foods?search=${search}`;
      const res = await api.get(endpoint);
      setFoods(res.data.data.foods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, isAvailable]);

  // Add item to order
  const addToOrder = (food) => {
    setShowOrder(true);
    const exist = orderItems.find((i) => i.foodName === food.name);
    if (exist) {
      setOrderItems(
        orderItems.map((i) =>
          i.foodName === food.name ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        { foodName: food.name, quantity: 1, price: food.price },
      ]);
    }
  };

  // Generate QR Data URL whenever generatedBill changes
  useEffect(() => {
    const genQR = async () => {
      if (!generatedBill) {
        setQrDataURL("");
        return;
      }
      try {
        const qrData = {
          billNumber: generatedBill.billNumber,
          totalAmount: generatedBill.totalAmount,
          date: generatedBill.paidAt,
          phone: generatedBill.customerDetails?.phone || "",
        };
        const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
        setQrDataURL(dataUrl);
      } catch (err) {
        console.error("QR generation error", err);
        setQrDataURL("");
      }
    };
    genQR();
  }, [generatedBill]);

  // Create bill on backend, store generatedBill, open preview modal
  const handleCreateBill = async () => {
    if (!customer.name || orderItems.length === 0) {
      alert("Please add items and customer name before generating bill.");
      return;
    }

    const payload = {
      orderType: customer.orderType,
      paymentMethod: customer.paymentMethod,
      discount: Number(customer.discount) || 0,
      customerDetails: {
        name: customer.name,
        phone: customer.phone,
      },
      items: orderItems.map(({ foodName, quantity, price }) => ({
        foodName,
        quantity,
        price,
      })),
      subtotal,
      totalAmount,
    };

    try {
      const res = await api.post("/bill/create-bill", payload);
      const billData = res.data.data;

      // Ensure items in bill include subtotal per item for display
      if (billData.items) {
        billData.items = billData.items.map((it, idx) => ({
          ...it,
          price: it.price ?? orderItems[idx]?.price ?? 0,
          subtotal: (it.price ?? orderItems[idx]?.price ?? 0) * (it.quantity ?? 1),
        }));
      }

      setGeneratedBill(billData);
      setShowPreviewModal(true); // open preview
      // generate QR will run via effect

      // reset order but keep generatedBill for preview until user closes modal if you want
      setOrderItems([]);
      setShowOrder(false);
      setCustomer({
        name: "",
        phone: "",
        discount: 0,
        orderType: "TAKEAWAY",
        paymentMethod: "CASH",
      });
    } catch (error) {
      console.error(error);
      alert("Error creating bill!");
    }
  };

  // Trigger PDF download and optionally close preview
  const downloadPDF = async (closeAfter = true) => {
    try {
      await toPDF(); // auto-download
      if (closeAfter) setShowPreviewModal(false);
    } catch (err) {
      console.error("PDF download error", err);
      alert("PDF generation failed");
    }
  };

  // Trigger browser print for the content inside modal (useful for direct thermal printing)
  const printReceipt = () => {
    // We'll open a new window with the receipt HTML and call print there (better thermal printing UX)
    if (!generatedBill) return;
    const printWindow = window.open("", "PRINT", "height=600,width=350");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const receiptHtml = renderReceiptHTML(generatedBill, qrDataURL);
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // optional: close after printing
    }, 500);
  };

  // Helper: produce HTML string for printing window
  const renderReceiptHTML = (bill, qrUrl = "") => {
    // Keep styles minimal and thermal-friendly
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt ${bill.billNumber}</title>
          <style>
            body { font-family: "Courier New", monospace; font-size:12px; width:300px; margin:0; padding:10px; color:#000;}
            .center { text-align:center; }
            .line { border-top:1px dashed #000; margin:8px 0; }
            table { width:100%; border-collapse: collapse; font-size:12px; }
            td { padding:2px 0; vertical-align:top; }
            .right { text-align:right; }
            .bold { font-weight:700; }
            .items td { padding:4px 0; }
            .qr { text-align:center; margin-top:8px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div>🍽️ NCB RESTAURANT</div>
          </div>
          <div class="line"></div>
          <div><strong>Bill No:</strong> ${bill.billNumber}</div>
          <div><strong>Date:</strong> ${new Date(bill.paidAt).toLocaleString()}</div>
          <div><strong>Order Type:</strong> ${bill.orderType}</div>
          <div><strong>Payment:</strong> ${bill.paymentMethod}</div>
          <div class="line"></div>
          <div><strong>Customer:</strong> ${bill.customerDetails?.name || "-"}</div>
          <div><strong>Phone:</strong> ${bill.customerDetails?.phone || "-"}</div>
          <div class="line"></div>

          <table class="items">
            <thead>
              <tr>
                <td class="bold">#</td>
                <td class="bold">Item</td>
                <td class="bold right">Qty</td>
                <td class="bold right">Amt</td>
              </tr>
            </thead>
            <tbody>
              ${bill.items
                .map(
                  (it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${escapeHtml(it.foodName)}</td>
                  <td class="right">${it.quantity}</td>
                  <td class="right">₹${Number(it.subtotal).toFixed(0)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <div class="line"></div>
          <table style="width:100%; font-size:12px;">
            <tr>
              <td>Subtotal</td>
              <td class="right">₹${Number(bill.subtotal).toFixed(0)}</td>
            </tr>
            <tr>
              <td>Discount</td>
              <td class="right">₹${Number(bill.discount || 0).toFixed(0)}</td>
            </tr>
            <tr>
              <td class="bold">Total</td>
              <td class="bold right">₹${Number(bill.totalAmount).toFixed(0)}</td>
            </tr>
          </table>

          <div class="line"></div>

          ${qrUrl ? `<div class="qr"><img src="${qrUrl}" width="120"/></div>` : ""}

          <div class="center" style="margin-top:8px;">Thank you for visiting! 😊</div>
        </body>
      </html>
    `;
  };

  // small escape for html
  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  return (
    <>
      {/* MAIN POS UI */}
      <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
        {/* LEFT - Food list */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-orange-600 mb-6">
            🍕 Restaurant POS Billing
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 flex-1"
            />
            <button
              onClick={fetchFoods}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              Search
            </button>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
              />
              Available only
            </label>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 mt-20">Loading...</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {foods.map((food) => (
                <motion.div
                  key={food._id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white shadow-lg rounded-xl overflow-hidden"
                >
                  <img
                    src={
                      food.image
                        ? food.image.replace(
                            "https://drive.google.com/file/d/",
                            "https://drive.google.com/uc?export=view&id="
                          )
                        : "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                    }
                    alt={food.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {food.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {food.description}
                    </p>
                    <p className="text-orange-600 font-semibold">
                      ₹{food.price}
                    </p>
                    <button
                      onClick={() => addToOrder(food)}
                      className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                    >
                      + Add to Order
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Order Summary */}
        <div className="w-96">
          <div className="bg-white shadow-2xl rounded-xl p-6 ml-6 flex flex-col">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">
              🧾 Current Order
            </h2>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 mb-4">
              {orderItems.length === 0 && (
                <div className="text-gray-500 text-sm">No items added</div>
              )}
              {orderItems.map((item) => (
                <div
                  key={item.foodName}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      {item.foodName}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setOrderItems(
                          orderItems.map((i) =>
                            i.foodName === item.foodName && i.quantity > 1
                              ? { ...i, quantity: i.quantity - 1 }
                              : i
                          )
                        )
                      }
                      className="px-2 bg-gray-200 rounded-md"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        setOrderItems(
                          orderItems.map((i) =>
                            i.foodName === item.foodName
                              ? { ...i, quantity: i.quantity + 1 }
                              : i
                          )
                        )
                      }
                      className="px-2 bg-gray-200 rounded-md"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 mb-4">
              <p className="flex justify-between">
                <span>Subtotal:</span> <span>₹{subtotal}</span>
              </p>
              <p className="flex justify-between">
                <span>Discount:</span>
                <input
                  type="number"
                  value={customer.discount}
                  onChange={(e) =>
                    setCustomer({ ...customer, discount: e.target.value })
                  }
                  className="w-20 border rounded-lg px-2 py-1 text-right"
                />
              </p>
              <p className="flex justify-between font-bold text-lg text-orange-600">
                <span>Total:</span> <span>₹{totalAmount}</span>
              </p>
            </div>

            <div className="mb-4 space-y-3">
              <select
                value={customer.orderType}
                onChange={(e) =>
                  setCustomer({ ...customer, orderType: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="TAKEAWAY">Takeaway</option>
                <option value="DINE-IN">Dine In</option>
                <option value="DELIVERY">Delivery</option>
              </select>

              <select
                value={customer.paymentMethod}
                onChange={(e) =>
                  setCustomer({ ...customer, paymentMethod: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateBill}
                disabled={!customer.name || orderItems.length === 0}
                className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
                  !customer.name || orderItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Generate Bill
              </button>

              <button
                onClick={() => {
                  // quick preview of current (not-saved) order as a temp bill
                  const tempBill = {
                    billNumber: `TEMP-${Date.now()}`,
                    paidAt: new Date().toISOString(),
                    orderType: customer.orderType,
                    paymentMethod: customer.paymentMethod,
                    customerDetails: { ...customer },
                    items: orderItems.map((it) => ({
                      foodName: it.foodName,
                      quantity: it.quantity,
                      price: it.price,
                      subtotal: it.price * it.quantity,
                    })),
                    subtotal,
                    discount: Number(customer.discount) || 0,
                    totalAmount,
                  };
                  setGeneratedBill(tempBill);
                  setShowPreviewModal(true);
                }}
                className="py-2 px-3 rounded-lg bg-orange-500 text-white"
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && generatedBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Bill Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadPDF(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => printReceipt()}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setGeneratedBill(null);
                  }}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>
            </div>

            {/* The receipt area captured by react-to-pdf */}
            <div className="p-4">
              <div
                ref={targetRef}
                style={{
                  width: 300, // ~80mm thermal width
                  padding: 12,
                  fontFamily: '"Courier New", monospace',
                  color: "#000",
                  background: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>🍽️ NCB RESTAURANT</div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

                <div style={{ fontSize: 11, marginBottom: 4 }}>
                  <div><strong>Bill No:</strong> {generatedBill.billNumber}</div>
                  <div><strong>Date:</strong> {new Date(generatedBill.paidAt).toLocaleString()}</div>
                  <div><strong>Order Type:</strong> {generatedBill.orderType}</div>
                  <div><strong>Payment:</strong> {generatedBill.paymentMethod}</div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

                <div style={{ fontSize: 11, marginBottom: 4 }}>
                  <div><strong>Customer:</strong> {generatedBill.customerDetails?.name || "-"}</div>
                  <div><strong>Phone:</strong> {generatedBill.customerDetails?.phone || "-"}</div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

                {/* Items header */}
                <div style={{ display: "flex", fontSize: 11, fontWeight: 700 }}>
                  <div style={{ width: 20 }}>#</div>
                  <div style={{ flex: 1 }}>Item</div>
                  <div style={{ width: 32, textAlign: "right" }}>Qty</div>
                  <div style={{ width: 56, textAlign: "right" }}>Amt</div>
                </div>

                <div style={{ height: 6 }} />

                {/* Items list */}
                {generatedBill.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", fontSize: 11, marginBottom: 3 }}>
                    <div style={{ width: 20 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>{it.foodName}</div>
                    <div style={{ width: 32, textAlign: "right" }}>{it.quantity}</div>
                    <div style={{ width: 56, textAlign: "right" }}>₹{Number(it.subtotal).toFixed(0)}</div>
                  </div>
                ))}

                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

                {/* Totals */}
                <div style={{ fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>Subtotal</div>
                    <div>₹{Number(generatedBill.subtotal).toFixed(0)}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>Discount</div>
                    <div>₹{Number(generatedBill.discount || 0).toFixed(0)}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontWeight: 700 }}>
                    <div>Total</div>
                    <div>₹{Number(generatedBill.totalAmount).toFixed(0)}</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                {/* QR */}
                {qrDataURL && (
                  <div style={{ textAlign: "center", marginTop: 6 }}>
                    <img src={qrDataURL} alt="qr" width={120} />
                    <div style={{ fontSize: 10, marginTop: 4 }}>Scan to view</div>
                  </div>
                )}

                <div style={{ marginTop: 8, textAlign: "center", fontSize: 11 }}>
                  Thank you for visiting! 😊
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FoodBillingPOS;
