import { profileRows, type TravelSession } from "./travel";

type Line = {
  text: string;
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  color?: string;
};
type PdfPage = { lines: Line[] };
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Standard PDF fonts are available in every reader. Normalize familiar travel
// punctuation and currency; preserve other Unicode as explicit code points.
export function pdfText(value: string): string {
  return value
    .replace(
      /東京|京都|大阪|札幌|福岡|仙台|名古屋|広島|神戸|横浜|奈良|金沢|沖縄|富士山|新幹線|日本/g,
      (place) =>
        (
          ({
            東京: "Tokyo",
            京都: "Kyoto",
            大阪: "Osaka",
            札幌: "Sapporo",
            福岡: "Fukuoka",
            仙台: "Sendai",
            名古屋: "Nagoya",
            広島: "Hiroshima",
            神戸: "Kobe",
            横浜: "Yokohama",
            奈良: "Nara",
            金沢: "Kanazawa",
            沖縄: "Okinawa",
            富士山: "Mount Fuji",
            新幹線: "Shinkansen",
            日本: "Japan",
          }) as Record<string, string>
        )[place] ?? place,
    )
    .replace(/₹/g, "INR ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑‒–—−﹘﹣－]/g, "-")
    .replace(/[\u00a0\u2000-\u200a\u202f\u205f\u3000]/g, " ")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/…/g, "...")
    .replace(/[•·]/g, " / ")
    .replace(/→/g, " to ")
    .replace(/←/g, " from ")
    .replace(/&nbsp;/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /[^\x20-\x7e\n\r\t]/gu,
      (character) =>
        `[U+${character.codePointAt(0)!.toString(16).toUpperCase()}]`,
    );
}

// Helvetica's standard Adobe glyph widths, in thousandths of an em.
const WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278,
  278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584,
  584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556,
  833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
  278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222,
  500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500,
  500, 334, 260, 334, 584,
];
function width(text: string, size: number) {
  return (
    ([...text].reduce(
      (total, char) => total + (WIDTHS[char.charCodeAt(0) - 32] ?? 600),
      0,
    ) *
      size) /
    1000
  );
}

function wrap(value: string, size: number, available: number): string[] {
  const result: string[] = [];
  for (const paragraph of pdfText(value).split(/\r?\n/)) {
    if (!paragraph.trim()) {
      result.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      if (line && width(`${line} ${word}`, size) > available) {
        result.push(line);
        line = "";
      }
      // Long URLs and uninterrupted provider data must also paginate safely.
      let piece = "";
      for (const character of word) {
        if (width(piece + character, size) > available) {
          if (line) {
            result.push(line);
            line = "";
          }
          result.push(piece);
          piece = "";
        }
        piece += character;
      }
      line = line ? `${line} ${piece}` : piece;
    }
    if (line) result.push(line);
  }
  return result;
}

class TripDocument {
  pages: PdfPage[] = [];
  y = 0;
  constructor() {
    this.newPage();
  }
  newPage() {
    this.pages.push({ lines: [] });
    this.y = 90;
  }
  space(amount = 10) {
    this.y += amount;
  }
  text(
    value: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: string;
      after?: number;
    } = {},
  ) {
    const size = options.size ?? 10.5;
    const leading = size * 1.45;
    // A small safety margin accounts for bold font metrics as well.
    for (const text of wrap(
      value,
      size,
      TEXT_WIDTH - (options.bold ? 26 : 0),
    )) {
      if (this.y + leading > PAGE_HEIGHT - 64) this.newPage();
      this.pages.at(-1)!.lines.push({
        text,
        x: MARGIN,
        y: this.y,
        size,
        bold: options.bold,
        color: options.color,
      });
      this.y += leading;
    }
    this.space(options.after ?? 5);
  }
  heading(value: string) {
    if (this.y + 80 > PAGE_HEIGHT - 64) this.newPage();
    this.space(12);
    this.text(value, {
      size: 16,
      bold: true,
      color: "0.12 0.29 0.25",
      after: 9,
    });
  }
  field(label: string, value: string | number | undefined) {
    if (value === undefined || value === "") return;
    this.text(`${label}: ${value}`);
  }
}

const money = (amount: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
const escape = (value: string) => value.replace(/([\\()])/g, "\\$1");
const dateLabel = (value: string) => value || "Dates to confirm";

/** Build a complete, actual PDF without a network call or a print dialog. */
export function buildTripPdf(session: TravelSession): Uint8Array {
  const trip = session.itinerary;
  if (!trip)
    throw new Error("Generate your itinerary before downloading its PDF.");
  const doc = new TripDocument();
  doc.text(trip.title || "Your Japan journey", {
    size: 25,
    bold: true,
    color: "0.12 0.29 0.25",
    after: 12,
  });
  doc.text(trip.summary, { size: 12, after: 12 });
  doc.text(
    `${trip.days.length} travel days / Created ${new Date().toISOString().slice(0, 10)}`,
    { size: 9, color: "0.4 0.43 0.41" },
  );
  if (session.needsRevision)
    doc.text(
      "REVISION NEEDED: Your preferences changed after this itinerary was created. Generate an updated plan before booking.",
      { bold: true },
    );

  const profile = session.interview?.profile;
  doc.heading("Your travel brief");
  if (profile) {
    for (const [label, value] of profileRows(profile)) doc.field(label, value);
    doc.field(
      "Travel dates",
      [profile.startDate, profile.endDate].filter(Boolean).join(" to "),
    );
    doc.field("Departure from India", profile.originAirport);
    doc.field(
      "Japan arrival / departure",
      [profile.arrivalAirport, profile.departureAirport]
        .filter(Boolean)
        .join(" / "),
    );
    doc.field("Nationality", profile.nationality);
    doc.field("Rooms requested", profile.rooms || undefined);
    doc.field("Profile summary", profile.summary);
  } else
    doc.text(
      "Travel profile not recorded. Confirm your group, dates, dietary needs and budget before booking.",
    );

  doc.heading("Day-by-day itinerary");
  for (const day of trip.days) {
    doc.heading(`Day ${day.day} / ${day.place} / ${dateLabel(day.date)}`);
    doc.field("Morning", day.morning);
    doc.field("Afternoon", day.afternoon);
    doc.field("Evening", day.evening);
    doc.field("Getting around", day.transport);
    doc.field("Food and dietary planning", day.food);
    doc.field("Overnight base", day.stayCity);
    doc.field("Notes", day.notes);
  }

  doc.heading("Where to stay");
  if (!trip.stays.length)
    doc.text("Hotel bases and dates still need confirmation.");
  for (const stay of trip.stays)
    doc.text(
      `${stay.city} / Check-in: ${dateLabel(stay.checkIn)} / Check-out: ${dateLabel(stay.checkOut)}`,
    );

  doc.heading("Planning budget / AI estimates");
  doc.text(
    "These are planning estimates, not booking quotes. Each item's stated basis controls whether it is per person, per room or for the group. Do not add differently scoped prices without adjusting quantities.",
  );
  if (profile?.budgetScope) doc.field("Your budget scope", profile.budgetScope);
  if (profile?.budgetINR)
    doc.field("Your target budget", money(profile.budgetINR));
  if (!trip.budget.length) doc.text("A cost breakdown has not been confirmed.");
  const groupAllowances = trip.budget.filter(
    (item) =>
      !/\bper\s+(?:person|travell?er|adult|child|room|night)\b|\bnightly\b|\beach person\b/i.test(
        item.basis,
      ),
  );
  if (groupAllowances.length) {
    doc.text(
      `Estimated group subtotal: ${money(groupAllowances.reduce((sum, item) => sum + item.lowINR, 0))} - ${money(groupAllowances.reduce((sum, item) => sum + item.highINR, 0))}`,
      { bold: true, size: 12 },
    );
    doc.text(
      "Sum of the estimated group allowances listed below only. Excludes unpriced items and anything not stated as included. Flight and hotel source prices are not added to this subtotal.",
    );
  }
  if (groupAllowances.length !== trip.budget.length)
    doc.text(
      "Items explicitly priced per person, room or night are excluded from the group subtotal until quantities are confirmed.",
    );
  for (const item of trip.budget) {
    doc.text(`${item.label}: ${money(item.lowINR)} - ${money(item.highINR)}`, {
      bold: true,
    });
    doc.field(
      "Estimate basis",
      item.basis || "Scope not specified; confirm before using this estimate.",
    );
  }

  doc.heading("Flight and hotel source snapshots");
  doc.text(
    "Search snapshots are separate from AI estimates. Availability, taxes and prices can change before checkout. A found result is not a reservation. Test or sandbox results are examples and cannot confirm live inventory.",
  );
  if (!session.searches.length)
    doc.text(
      "No live booking source results were available for this plan. Check current flight and hotel prices directly before making payments.",
    );
  for (const result of session.searches) {
    doc.heading(
      `${result.kind === "flight" ? "Flights" : "Hotels"} / ${result.title}`,
    );
    doc.field(
      "Result status",
      result.status === "test"
        ? "TEST / SANDBOX - not live availability"
        : result.status,
    );
    doc.field("Search scope", result.scope);
    doc.field("Checked at (source timestamp)", result.checkedAt);
    doc.field("Source note", result.note);
    if (!result.offers.length)
      doc.text(
        "No priced offers returned. Use the source note above to see what still needs checking.",
      );
    for (const offer of result.offers) {
      doc.text(`${offer.name} / ${money(offer.priceINR)}`, { bold: true });
      doc.field("Price basis", offer.basis);
      doc.field(
        "Taxes and fees",
        offer.taxes || "Not confirmed; review final provider checkout.",
      );
      doc.field("Source URL", offer.url);
    }
  }

  doc.heading("Checks before booking");
  for (const item of trip.unresolved) doc.text(`- ${item}`);
  doc.text(
    "- Recheck exact station names, train operators, transfers and journey times with an official journey planner.",
  );
  doc.text(
    "- Confirm passport and visa requirements, attraction opening days, dietary suitability and accessibility directly with the relevant provider.",
  );
  doc.text(
    "- Review room occupancy, child policies, cancellation terms, baggage and the final payable total before confirming any booking.",
  );
  const choices = session.messages.filter(
    (message) =>
      message.role === "user" &&
      !/^(?:show|give|suggest|see)\b.*\b(?:different|more|other)\b.*\b(?:choices|options)\b|^(?:generate|create|build)\b.*\b(?:trip|itinerary|plan)\b|^start (?:again|over)\b/i.test(
        message.content.trim(),
      ),
  );
  if (choices.length) {
    doc.heading("Your planning choices");
    doc.text(
      "The preferences you selected during your planning conversation, retained as context for this itinerary.",
    );
    choices.forEach((message, index) =>
      doc.text(`${index + 1}. ${message.content}`),
    );
  }
  return encodePdf(doc.pages);
}

function encodePdf(pages: PdfPage[]): Uint8Array {
  const objects: string[] = [];
  const add = (object: string) => {
    objects.push(object);
    return objects.length;
  };
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  const regular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const bold = add(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  );
  const pageRefs: number[] = [];
  for (const [index, page] of pages.entries()) {
    const lines: Line[] = [
      {
        text: "JAPAN, YOUR WAY",
        x: MARGIN,
        y: 42,
        size: 10,
        bold: true,
        color: "0.12 0.29 0.25",
      },
      ...page.lines,
      {
        text: `YOUR PERSONAL TRAVEL PLAN / ${index + 1} of ${pages.length}`,
        x: MARGIN,
        y: PAGE_HEIGHT - 32,
        size: 8,
        color: "0.4 0.43 0.41",
      },
    ];
    let content = `0.84 0.72 0.43 RG 0.6 w ${MARGIN} ${PAGE_HEIGHT - 57} m ${PAGE_WIDTH - MARGIN} ${PAGE_HEIGHT - 57} l S\n`;
    for (const line of lines)
      content += `BT /${line.bold ? "F2" : "F1"} ${line.size} Tf ${line.color ?? "0.15 0.18 0.17"} rg 1 0 0 1 ${line.x} ${(PAGE_HEIGHT - line.y).toFixed(2)} Tm (${escape(line.text)}) Tj ET\n`;
    const stream = add(
      `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    );
    pageRefs.push(
      add(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${stream} 0 R >>`,
      ),
    );
  }
  objects[1] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs.map((id) => `${id} 0 R`).join(" ")}] >>`;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1))
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

export async function downloadTripPdf(session: TravelSession): Promise<void> {
  const bytes = buildTripPdf(session);
  const url = URL.createObjectURL(
    new Blob([bytes as BlobPart], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "Japan-Your-Way-Personal-Itinerary.pdf";
  document.body.append(link);
  link.click();
  link.remove();
  // Downloads may start asynchronously in mobile Safari.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
