import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// Configure SMTP Transporter
// Env variables fallback to a standard configuration if not defined
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: (process.env.SMTP_PORT || "465") === "465",
  auth: {
    user: process.env.SMTP_USER || "booking@sitxplore.in",
    pass: process.env.SMTP_PASS || "",
  },
});

// Helper to generate a PDF buffer using pdfkit
const generateInvoicePDFBuffer = (booking) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Colors
    const primaryColor = "#072113"; // SIT Xplore Dark Green
    const secondaryColor = "#e0a816"; // Gold accent
    const textColor = "#1e293b"; // Dark gray text
    const lightBg = "#f8fafc"; // Light card background

    // Header green banner
    doc.rect(0, 0, doc.page.width, 95).fill(primaryColor);
    
    // Gold accent strip
    doc.rect(0, 95, doc.page.width, 4).fill(secondaryColor);

    // Title / Logo text
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(22)
       .text("SIT XPLORE", 40, 28);

    doc.font("Helvetica-Bold")
       .fontSize(7)
       .fillColor("#d1d5db")
       .text("EXPLORE MORE, WORRY LESS", 40, 52);

    doc.font("Helvetica")
       .fontSize(8)
       .fillColor("#9ca3af")
       .text("Sonipat, Haryana | booking@sitxplore.in | www.sitxplore.in", 40, 68);

    // Google review/stats inside header
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(8)
       .text("🛡️ 50K+ TRIPS SERVED", 400, 28, { align: "right" });
    
    doc.text("👥 70,000+ HAPPY TRAVELERS", 400, 42, { align: "right" });
    
    doc.fillColor(secondaryColor)
       .text("★ 5★ GOOGLE REVIEWS", 400, 56, { align: "right" });

    // Invoice Meta Info
    doc.fillColor(textColor)
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("BOOKING INVOICE & RECEIPT", 40, 120);

    const invoiceNum = booking.bookingId.slice(-4).toUpperCase();
    doc.font("Helvetica-Bold")
       .fontSize(10)
       .text(`Invoice No: SITX-${invoiceNum}`, 40, 142);
    
    doc.font("Helvetica")
       .fontSize(9)
       .fillColor("#475569")
       .text(`Date: ${new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, 40, 156);

    // Customer details block
    doc.rect(40, 185, doc.page.width - 80, 55)
       .fill(lightBg)
       .stroke("#e2e8f0");

    doc.fillColor(textColor)
       .font("Helvetica-Bold")
       .fontSize(9)
       .text("CUSTOMER DETAILS", 50, 195);

    doc.font("Helvetica")
       .fontSize(9)
       .text(`Lead Traveler: ${booking.customerName}`, 50, 210)
       .text(`Email: ${booking.customerEmail}`, 210, 210)
       .text(`Mobile: ${booking.customerPhone}`, 390, 210);

    // Travel configuration block
    doc.rect(40, 260, doc.page.width - 80, 110)
       .fill("#ffffff")
       .stroke("#e2e8f0");

    doc.fillColor(textColor)
       .font("Helvetica-Bold")
       .fontSize(9)
       .text("TRAVEL CONFIGURATION", 50, 270);

    // Table rows
    const drawRow = (label, value, y) => {
      doc.font("Helvetica-Bold").fillColor("#475569").text(label, 50, y);
      doc.font("Helvetica").fillColor(textColor).text(value, 200, y);
      doc.moveTo(40, y + 14).lineTo(doc.page.width - 40, y + 14).strokeColor("#e2e8f0").stroke();
    };

    drawRow("Departure Date", booking.travelDate || "N/A", 290);
    drawRow("Room Sharing", booking.sharingSelected ? booking.sharingSelected.replace("Sharing", " Sharing").toUpperCase() : "N/A", 310);
    drawRow("Route / Package", booking.package?.title || "N/A", 330);
    drawRow("Number of Travelers", `${booking.totalTravelers} Head(s) ${booking.travelersList?.length > 0 ? `(${booking.travelersList.join(", ")})` : ""}`, 350);

    // Pricing breakdowns
    const baseCost = Math.round(booking.totalCost / 1.05);
    const gstAmount = booking.totalCost - baseCost;
    const remainingBalance = booking.totalCost - booking.amountPaid;

    doc.fillColor(textColor)
       .font("Helvetica-Bold")
       .fontSize(9)
       .text("PAYMENT SUMMARY", 40, 395);

    const drawSummaryBox = (title, amount, x, color = textColor) => {
      doc.rect(x, 410, 160, 50).fill("#ffffff").stroke("#e2e8f0");
      doc.fillColor("#64748b").font("Helvetica-Bold").fontSize(7).text(title.toUpperCase(), x + 10, 420);
      doc.fillColor(color).font("Helvetica-Bold").fontSize(12).text(`INR ${amount.toLocaleString("en-IN")}`, x + 10, 435);
    };

    drawSummaryBox("Base Package Cost", baseCost, 40);
    drawSummaryBox("GST (5%) Surcharge", gstAmount, 213);
    drawSummaryBox("Total Cost (incl. GST)", booking.totalCost, 386);

    drawSummaryBox("Advance Paid", booking.amountPaid, 40, "#16a34a");
    drawSummaryBox("Remaining Balance", remainingBalance, 213, "#dc2626");

    // Amount in words box
    doc.rect(386, 480, 160, 50).fill(primaryColor);
    doc.fillColor("#d1d5db").font("Helvetica-Bold").fontSize(6.5).text("ADVANCE PAID (IN WORDS)", 396, 490);
    
    // Words logic helper
    const numberToWords = (num) => {
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      if (num === 0) return 'Zero';
      if (num < 20) return a[num] + ' Only';
      let words = '';
      if (num >= 1000) {
        words += a[Math.floor(num / 1000)] + ' Thousand ';
        num %= 1000;
      }
      if (num >= 100) {
        words += a[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num > 0) {
        if (num < 20) words += a[num];
        else {
          words += b[Math.floor(num / 10)];
          if (num % 10 > 0) words += ' ' + a[num % 10];
        }
        words += ' Only';
      }
      return words.trim();
    };
    
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5).text(numberToWords(booking.amountPaid), 396, 505);

    // Terms section
    doc.rect(40, 560, doc.page.width - 80, 80).fill(lightBg).stroke("#e2e8f0");
    doc.fillColor(textColor).font("Helvetica-Bold").fontSize(8).text("TERMS & CONDITIONS", 50, 570);
    
    doc.font("Helvetica").fontSize(7.5).fillColor("#475569")
       .text(`* Payment Due: Remaining balance of INR ${remainingBalance.toLocaleString()} is due at boarding or 7 days prior to travel.`, 50, 585)
       .text("* Cancellation Policy: Free cancellation up to 15 days before travel (excl. non-refundable deposit).", 50, 597)
       .text("* Inclusions Support: Reach out to booking@sitxplore.in or call +91-9050553507 for hotel query assistance.", 50, 609);

    // Footer contact ribbon
    doc.rect(0, doc.page.height - 45, doc.page.width, 45).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5).text("Thank You for Booking with SIT Xplore!", 40, doc.page.height - 25);
    doc.fillColor("#9ca3af").font("Helvetica").fontSize(7.5).text("Support Contacts: +91-9050553507, 7027878371 | Email: booking@sitxplore.in", 400, doc.page.height - 25, { align: "right" });

    doc.end();
  });
};

// Send email notification with PDF attachment
export const sendInvoiceEmail = async (booking) => {
  try {
    const pdfBuffer = await generateInvoicePDFBuffer(booking);
    const invoiceNum = booking.bookingId.slice(-4).toUpperCase();
    const customerEmail = booking.customerEmail;

    // Sender is configured to use your business email address booking@sitxplore.in
    const fromAddress = `"SIT Xplore Bookings" <booking@sitxplore.in>`;

    const mailOptions = {
      from: fromAddress,
      to: customerEmail,
      subject: `Booking Confirmed! Receipt No: SITX-${invoiceNum}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
          <div style="background-color: #072113; padding: 24px; text-align: center; border-bottom: 4px solid #e0a816;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">SIT XPLORE</h1>
            <p style="color: #d1d5db; margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Explore More, Worry Less</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin-top: 0; color: #072113; font-size: 18px;">Booking Confirmed!</h2>
            <p>Dear <strong>${booking.customerName}</strong>,</p>
            <p>We are delighted to confirm your tour booking. Your deposit payment has been received successfully.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin-top: 0; font-size: 14px; color: #072113; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">BOOKING SUMMARY</h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Package:</strong></td>
                  <td style="padding: 4px 0; text-align: right;">${booking.package?.title}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Departure Date:</strong></td>
                  <td style="padding: 4px 0; text-align: right;">${booking.travelDate}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Advance Paid:</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: bold;">INR ${booking.amountPaid?.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Remaining Balance:</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #dc2626; font-weight: bold;">INR ${(booking.totalCost - booking.amountPaid)?.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; line-height: 1.5;">
              We have attached your official PDF invoice receipt (Invoice No: <strong>SITX-${invoiceNum}</strong>) to this email for your reference.
            </p>
            
            <p style="font-size: 13px; line-height: 1.5; margin-bottom: 0;">
              For any support regarding pickup slots, accommodations, or trip itineraries, please reach out to us at <strong>booking@sitxplore.in</strong> or call <strong>+91-9050553507</strong>.
            </p>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} SIT Xplore. All rights reserved.</p>
            <p style="margin: 4px 0 0 0;">Sonipat, Haryana | booking@sitxplore.in</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_SITX_${invoiceNum}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${customerEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("sendInvoiceEmail error:", error);
    return false;
  }
};
