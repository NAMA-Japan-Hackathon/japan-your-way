import Link from "next/link";
import { Header, Footer, ArrowUpRight } from "./shared";
export function Information({ help = false }: { help?: boolean }) {
  const sections = help
    ? [
        [
          "Planning across Japan",
          "Explore all 47 prefectures and selected national rail corridors. The AI planner chooses a coherent route around your interests, timing, pace and budget. Restaurant research currently covers Tokyo, Kyoto and Osaka; it does not represent every restaurant in Japan.",
        ],
        [
          "Your information",
          "Your active conversation, optional food and access preferences, itinerary and saved copies are stored in this browser. Messages and active trip context are also sent through our server to Groq so the assistant can respond. Only share information you are comfortable sending to that service. Do not include passports, payment details, API keys or private documents. No account is required; this website does not maintain a conversation database.",
        ],
        [
          "Price searches",
          "When connected, price searches send dates, route and occupancy to SerpApi, which returns Google Flights and Hotels search results for the Indian market in INR. If connected, direct hotel searches also send occupancy, dates, destination and a voluntarily supplied guest nationality to LiteAPI. LiteAPI sandbox responses are explicitly test data and cannot establish live availability. The complete chat is not sent for price searches. Results show their search scope and attempt time. They are snapshots, not reservations. MakeMyTrip and Agoda links do not mean those providers have been independently checked.",
        ],
        [
          "Estimates and missing information",
          "AI planning allowances are rough estimates, shown separately from source-returned prices. Exact dates, airports, travelers and room arrangements are needed to check prices. Missing details, unavailable sources and failed searches stay visible. The connected search currently supports return flights to the same Japan airport and one-room hotel searches for up to four overnight bases per check. Other arrangements require a provider check.",
        ],
        [
          "Food and access",
          "Tell the planner what matters, or skip a question you prefer not to answer. Confirm ingredients, dashi, preparation, cross-contact and accessibility directly with the venue. AI suggestions and dietary labels cannot establish food safety or medical suitability.",
        ],
        [
          "Saving, downloading and deleting",
          "Save a separate itinerary from the trip view and reopen it from Saved plans on this device. Download a text copy to keep or share. The download includes your itinerary and any food/access notes it contains; review it before sharing. New trip clears the active conversation and draft; Clear chat removes the separate assistant conversation. Delete saved copies individually, or clear this website’s browser data to remove all local information. Clearing local data does not erase information already processed by an external provider. Browser storage is not an encrypted vault.",
        ],
        [
          "Before booking",
          "Review official destination and transport sources, current entry requirements, supplier terms, total prices, cancellation conditions and availability before paying. Complete bookings with your chosen provider. This site does not take payment, issue tickets, reserve rooms or act as an official Japan tourism bureau. Earlier saved sample plans remain available with their original illustrative estimates.",
        ],
      ]
    : [
        [
          "Start with the trip you imagine",
          "Tell us what draws you to Japan and who is coming with you. Your answers shape the next question. There is no fixed five-question form or required question count.",
        ],
        [
          "Follow what matters",
          "The planner builds a visible summary of your interests, dates, companions, budget, pace, lodging and everyday needs. It asks followups where they help, accepts uncertainty and lets you skip questions. Correct an earlier detail at any time.",
        ],
        [
          "Create your itinerary",
          "When you are ready, ask for a draft with daily experiences, journeys, meals, overnight bases, estimated group allowances and unresolved questions. Keep talking to refine it, then create a revised itinerary. Changing your preferences marks the old draft as needing revision.",
        ],
        [
          "Check prices separately",
          "A connected price source searches flights and hotels using exact dates and occupancy. Source-returned prices remain separate from AI estimates and show what was searched and when. Missing booking connections are labeled; the assistant cannot create live availability from memory.",
        ],
        [
          "Keep a little guidance nearby",
          "The Japan travel assistant is available at the bottom right of every page. It uses your active AI trip preferences and itinerary to answer Japan travel questions. It can suggest changes; use the planner to apply them to a revised trip.",
        ],
        [
          "Save it your way",
          "Save your itinerary in this browser, or download a readable copy. Confirm practical details and book directly with the relevant hotel or airline. Nothing is reserved by generating a plan.",
        ],
      ];
  return (
    <>
      <Header />
      <main id="main" className="page information-page">
        <div className="page-intro">
          <h1>
            {help ? "A clearer starting point." : "A conversation. Your Japan."}
          </h1>
          <p>
            {help
              ? "What the planner does, where your information goes, and what needs a real-world check."
              : "Start with what you imagine. Refine the details together."}
          </p>
        </div>
        <div className="information-content">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
        <Link className="button" href="/plan/">
          Start planning <ArrowUpRight size={18} />
        </Link>
      </main>
      <Footer />
    </>
  );
}
