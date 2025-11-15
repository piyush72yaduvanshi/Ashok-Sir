import React, { useState, useEffect } from "react";
import api from "../config/api";
import { motion } from "framer-motion";
import { FileDown, Eye } from "lucide-react";
import { usePDF } from "react-to-pdf";
import QRCode from "qrcode";

const BillManagementPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedBill, setSelectedBill] = useState(null);
  const [qrDataURL, setQrDataURL] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { toPDF, targetRef } = usePDF({ filename: "NCB_BILL_80mm.pdf" });

  // ================================================
  // 1. Fetch all bills
  // ================================================
  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bill/all-bills");
      setBills(res.data.data || []);
    } catch (err) {
      console.error("Error loading bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ================================================
  // 2. Fetch JSON bill data + Show Preview Modal
  // ================================================
  const fetchBillJSON = async (billNumber) => {
    try {
      const res = await api.post("/bill/pdf", { billNumber });

      if (!res.data.success) {
        alert("Bill not found");
        return;
      }

      const billData = res.data.data;

      // Ensure subtotal per item
      billData.items = billData.items.map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
      }));

      // Generate QR code
      const qr = await QRCode.toDataURL(
        JSON.stringify({
          billNumber: billData.billNumber,
          totalAmount: billData.totalAmount,
          date: billData.paidAt,
          phone: billData.customerDetails.phone,
        })
      );

      setQrDataURL(qr);
      setSelectedBill(billData);
      setShowPreview(true);
    } catch (err) {
      console.error("Bill fetch error:", err);
      alert("Failed to fetch bill details.");
    }
  };

  // ================================================
  // 3. Direct thermal print (no PDF)
  // ================================================
  const printReceipt = () => {
    if (!selectedBill) return;

    const bill = selectedBill;
    const qr = qrDataURL;

    const printWindow = window.open("", "PRINT", "height=600,width=350");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${bill.billNumber}</title>
          <style>
            body { font-family: "Courier New", monospace; width:260px; font-size:12px; }
            .center { text-align:center; }
            .line { border-top:1px dashed #000; margin:5px 0; }
            table { width:100%; font-size:12px; }
            td { padding:3px 0; }
            .right { text-align:right; }
            .bold { font-weight:700; }
          </style>
        </head>
        <body>

          <div class="center bold">🍽️ NCB RESTAURANT</div>
          <div class="line"></div>

          <div><b>Bill No:</b> ${bill.billNumber}</div>
          <div><b>Date:</b> ${new Date(bill.paidAt).toLocaleString()}</div>
          <div><b>Order:</b> ${bill.orderType}</div>
          <div><b>Payment:</b> ${bill.paymentMethod}</div>

          <div class="line"></div>

          <div><b>Name:</b> ${bill.customerDetails.name}</div>
          <div><b>Phone:</b> ${bill.customerDetails.phone}</div>

          <div class="line"></div>

          <table>
            ${bill.items
              .map(
                (it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${it.foodName}</td>
                <td class="right">${it.quantity}</td>
                <td class="right">₹${it.subtotal}</td>
              </tr>`
              )
              .join("")}
          </table>

          <div class="line"></div>

          <table>
            <tr><td>Subtotal</td><td class="right">₹${bill.subtotal}</td></tr>
            <tr><td>Discount</td><td class="right">₹${bill.discount}</td></tr>
            <tr class="bold"><td>Total</td><td class="right">₹${bill.totalAmount}</td></tr>
          </table>

          <div class="line"></div>

          ${
            qr
              ? `<div class="center"><img src="${qr}" width="120"/></div>`
              : ""
          }

          <div class="center" style="margin-top:8px;">Thank you! 😊</div>

        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => printWindow.print(), 500);
  };

  // ================================================
  // 4. Search filter
  // ================================================
  const filteredBills = bills.filter((b) =>
    b.billNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 px-6 py-8">

      {/* TITLE */}
      <h1 className="text-3xl font-extrabold text-orange-600 mb-6 text-center">
        🧾 Bill Management System
      </h1>

      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search Bill Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg shadow-sm w-full sm:w-96"
        />
        <button
          onClick={() => fetchBillJSON(search.trim())}
          disabled={!search.trim()}
          className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700"
        >
          🔍 Fetch Bill
        </button>
      </div>

      {/* BILL TABLE */}
      {loading ? (
        <div className="text-center text-gray-500 mt-20">Loading...</div>
      ) : bills.length === 0 ? (
        <p className="text-center mt-10 text-gray-600">No bills found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow-md">
            <thead>
              <tr className="bg-orange-600 text-white text-sm uppercase">
                <th className="py-3 px-4 text-left">Bill No</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-center">Total</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.map((bill, index) => (
                <motion.tr
                  key={index}
                  whileHover={{ backgroundColor: "#fff7eb" }}
                  className="border-b text-sm"
                >
                  <td className="py-3 px-4 font-semibold text-orange-700">
                    {bill.billNumber}
                  </td>
                  <td className="py-3 px-4">{bill.customerDetails.name}</td>
                  <td className="py-3 px-4">{bill.customerDetails.phone}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    ₹{bill.totalAmount}
                  </td>
                  <td className="py-3 px-4 text-center">{bill.paymentMethod}</td>
                  <td className="py-3 px-4 text-center">{bill.orderType}</td>
                  <td className="py-3 px-4 text-center">
                    {new Date(bill.paidAt).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => fetchBillJSON(bill.billNumber)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => fetchBillJSON(bill.billNumber)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      <FileDown size={14} /> PDF
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================
          PREVIEW MODAL (PDF + PRINT)
      ====================================================== */}
      {showPreview && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[350px] p-4">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="font-bold text-lg">Bill Preview</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => toPDF()}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  PDF
                </button>

                <button
                  onClick={printReceipt}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Print
                </button>

                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  X
                </button>
              </div>
            </div>

            {/* RECEIPT AREA */}
            <div
              ref={targetRef}
              style={{
                width: 300,
                padding: 12,
                background: "white",
                color: "black",
                fontFamily: '"Courier New", monospace',
                lineHeight: "1.2",
              }}
            >
              <div style={{ textAlign: "center", fontWeight: 700 }}>
                🍽️ NCB RESTAURANT
              </div>

              <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

              <div style={{ fontSize: 11 }}>
                <div><b>Bill No:</b> {selectedBill.billNumber}</div>
                <div><b>Date:</b> {new Date(selectedBill.paidAt).toLocaleString()}</div>
                <div><b>Order:</b> {selectedBill.orderType}</div>
                <div><b>Payment:</b> {selectedBill.paymentMethod}</div>
              </div>

              <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

              <div style={{ fontSize: 11 }}>
                <div><b>Name:</b> {selectedBill.customerDetails.name}</div>
                <div><b>Phone:</b> {selectedBill.customerDetails.phone}</div>
              </div>

              <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

              {selectedBill.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}
                >
                  <span>{idx + 1}. {it.foodName}</span>
                  <span>
                    {it.quantity} × ₹{it.price} = ₹{it.subtotal}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

              <div style={{ fontSize: 11 }}>
                <div><b>Subtotal:</b> ₹{selectedBill.subtotal}</div>
                <div><b>Discount:</b> ₹{selectedBill.discount}</div>
                <div><b>Total:</b> ₹{selectedBill.totalAmount}</div>
              </div>

              <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

              {qrDataURL && (
                <div style={{ textAlign: "center" }}>
                  <img src={qrDataURL} width={120} alt="qr" />
                </div>
              )}

              <div style={{ textAlign: "center", marginTop: 8 }}>
                Thank you for visiting! 😊
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillManagementPage;
