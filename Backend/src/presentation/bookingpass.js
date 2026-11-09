import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const colors = {
  paper: rgb(0.98, 0.96, 0.93),
  card: rgb(1, 0.985, 0.965),
  ink: rgb(0.21, 0.15, 0.13),
  brown: rgb(0.53, 0.35, 0.30),
  gold: rgb(0.69, 0.52, 0.27),
  muted: rgb(0.46, 0.36, 0.30),
  stub: rgb(0.95, 0.91, 0.86),
};

function printable(font, value) {
  return Array.from(String(value ?? ""), char => {
    try {
      font.encodeText(char);
      return char;
    } catch {
      return "?";
    }
  }).join("");
}

function wrap(font, value, size, width) {
  const lines = [];
  for (const paragraph of printable(font, value).split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(next, size) <= width) {
        line = next;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      for (const char of word) {
        if (line && font.widthOfTextAtSize(line + char, size) > width) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}

function rounded(page, x, top, width, height, radius, fill, border) {
  const path = `M ${radius} 0 H ${width - radius} Q ${width} 0 ${width} ${radius} V ${height - radius} Q ${width} ${height} ${width - radius} ${height} H ${radius} Q 0 ${height} 0 ${height - radius} V ${radius} Q 0 0 ${radius} 0 Z`;
  page.drawSvgPath(path, { x, y: top, color: fill, borderColor: border, borderWidth: border ? 1.5 : 0 });
}

export async function renderBookingPass({ booking, attendeeName, qr }) {
  const document = await PDFDocument.create();
  const body = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRomanBold);
  const mono = await document.embedFont(StandardFonts.Courier);
  const title = wrap(serif, booking.event.title, 25, 502);
  const name = wrap(bold, attendeeName, 15, 502);
  const location = wrap(bold, booking.event.location || "To be announced", 12, 245);
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(booking.event.date);
  const dateLines = wrap(bold, date, 12, 235);
  const detailsHeight = Math.max(location.length, dateLines.length) * 17;
  const height = Math.max(370, 214 + title.length * 29 + name.length * 19 + detailsHeight + 44);
  const page = document.addPage([850, height]);
  document.setTitle(`EventSphere pass - ${booking.event.title}`);
  document.setAuthor("EventSphere");
  page.drawRectangle({ x: 0, y: 0, width: 850, height, color: colors.paper });
  rounded(page, 18, height - 18, 814, height - 36, 22, colors.card, colors.gold);
  rounded(page, 34, height - 34, 532, 57, 14, colors.brown);
  rounded(page, 610, height - 34, 204, height - 68, 16, colors.stub);

  const text = (value, x, top, size, font = body, color = colors.ink) => page.drawText(printable(font, value), {
    x, y: height - top - size, size, font, color,
  });
  const lines = (values, x, top, size, font, leading) => values.forEach((value, index) => text(value, x, top + index * leading, size, font));
  text("EventSphere", 50, 45, 22, serif, colors.card);
  text("CONFIRMED ENTRY PASS", 50, 73, 8, bold, colors.card);
  const ticket = printable(bold, booking.ticketType || "Standard").toUpperCase();
  text(ticket, 550 - bold.widthOfTextAtSize(ticket, 10), 57, 10, bold, colors.card);
  let top = 108;
  lines(title, 50, top, 25, serif, 29);
  top += title.length * 29 + 17;
  text("PASS HOLDER", 50, top, 9, bold, colors.muted);
  top += 19;
  lines(name, 50, top, 15, bold, 19);
  top += name.length * 19 + 24;
  text("EVENT DATE", 50, top, 9, bold, colors.muted);
  text("LOCATION", 311, top, 9, bold, colors.muted);
  top += 22;
  lines(dateLines, 50, top, 12, bold, 17);
  lines(location, 311, top, 12, bold, 17);
  const reference = String(booking._id);
  text("BOOKING REFERENCE", 50, height - 64, 8, bold, colors.muted);
  text(reference, 50, height - 48, 11, mono, colors.brown);

  page.drawLine({ start: { x: 588, y: 28 }, end: { x: 588, y: height - 28 }, thickness: 1.5, color: colors.gold, dashArray: [5, 6] });
  for (const y of [18, height - 18]) {
    page.drawCircle({ x: 588, y, size: 11, color: colors.paper, borderColor: colors.gold, borderWidth: 1.5 });
  }
  const qrImage = await document.embedPng(qr);
  page.drawImage(qrImage, { x: 626, y: height - 222, width: 172, height: 172 });
  const centered = (value, top, size, font = bold, color = colors.ink) => {
    text(value, 712 - font.widthOfTextAtSize(printable(font, value), size) / 2, top, size, font, color);
  };
  centered("SCAN FOR ENTRY", 239, 11);
  centered("Present this QR code at check-in", 260, 8, body, colors.muted);
  centered("CONFIRMED", height - 87, 9, bold, colors.brown);
  centered(reference, height - 58, 8, mono, colors.muted);
  return document.save();
}
