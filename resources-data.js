// Lintel resources: original articles written for the Lintel site. Shared by resources.html and article.html.
window.LINTEL_CATS = {
  "field-notes": "Field notes",
  "ai-in-practice": "AI in practice",
  "drawing-workflows": "Drawing workflows",
};

window.LINTEL_POSTS = [
  {
    slug: "the-door-that-failed-plan-check", cat: "field-notes", date: "2026-10-28", read: 5, seed: 11,
    title: "The door that failed plan check",
    excerpt: "A 760 mm door, three revisions and a reviewer's red pen. What one small dimension costs when nobody is watching it.",
    body: [
      "Every office has a version of this story. A consultation room door is drawn at 760 mm early in design, when nobody is thinking about clear width. The plan goes through three rounds of revision, two people touch the room, and the number never changes. Then the plan reviewer circles it.",
      "The fix itself takes a minute: widen the opening, adjust the frame, move on. The cost is everything around that minute. A resubmission, a meeting to explain it, and a quiet loss of confidence from a client who assumed the drawings were checked.",
      "## Why it slips through",
      "Nobody forgot the rule. The problem is that a rule held in someone's head is only checked when that person looks at that room. Drawings change faster than people review them, so the gaps open between reviews, not during them.",
      "> A rule held in someone's head is only checked when that person looks at that room.",
      "Lintel checks every sync instead of every deadline. The door is flagged the moment it is drawn, with the measured value, the required value and the section it comes from, and the fix is waiting for an approver before the drawing ever leaves the office.",
    ],
  },
  {
    slug: "why-we-store-numbers-not-code-text", cat: "ai-in-practice", date: "2026-10-21", read: 4, seed: 23,
    title: "Why we store numbers, not code text",
    excerpt: "Lintel never quotes a building code. A rule is a value, a scope and a reference, and that choice keeps the assistant honest.",
    body: [
      "It is tempting to give an AI assistant the full text of a building code and let it reason. We decided against it, for two reasons that turn out to be the same reason.",
      "First, codes are adopted, amended and superseded by jurisdiction. The text an assistant remembers may not be the text your project is held to. Second, an answer that paraphrases code text sounds authoritative even when it is wrong.",
      "## A rule is a number with a source",
      "In Lintel a rule is small: what it applies to, the property it measures, the value, and the section it comes from, with a note to verify it against your adopted edition. The checker compares numbers. It never decides by reading prose.",
      "> The assistant explains and proposes. The checker decides pass or fail.",
      "That split matters. The assistant can help you understand an issue or draft a fix, but whether a door passes is settled by arithmetic against your firm's own table. When the assistant cites a section, it is citing your rule, not its memory.",
    ],
  },
  {
    slug: "one-undo-step", cat: "drawing-workflows", date: "2026-10-14", read: 3, seed: 37,
    title: "One undo step, every time",
    excerpt: "An approved change lands in your CAD model as a single undo record. Here's why that matters more than speed.",
    body: [
      "When Lintel applies an approved change, it wraps every edit in that change set into one undo record. Widen a door and adjust a stair in the same set, and Ctrl+Z takes both back together.",
      "It sounds like a detail. In practice it is what makes people comfortable letting software touch a live model. If an edit surprises you, you are one keystroke from where you were.",
      "## Nothing applies to a moved target",
      "Every edit carries the value it expects to find. If someone changed the door after the proposal was approved, the plugin refuses the whole set and reports why, rather than overwriting work it did not see.",
      "Fast is nice. Predictable is what earns a place in the toolbar.",
    ],
  },
  {
    slug: "a-standard-is-a-table", cat: "field-notes", date: "2026-10-07", read: 4, seed: 41,
    title: "Your office standard is a table",
    excerpt: "Most firm standards live in a PDF nobody opens. Turning them into twelve rows changed how one studio reviewed drawings.",
    body: [
      "We asked a pilot studio for their office standard. They sent a 40-page PDF, carefully written and almost never read after onboarding.",
      "Inside it were about a dozen numbers that mattered day to day: minimum door widths by room type, corridor clearances, stair geometry, room areas for their healthcare work. Everything else was guidance.",
      "## Twelve rows",
      "We put those numbers in a table with a reference for each, imported it as CSV, and switched the rules on. The first sync flagged nine things across three projects, two of which were already on a reviewer's list for the following week.",
      "> The PDF still exists. The table is what gets checked.",
      "Rules can be switched off for a single project, overridden where a building is sprinklered, and suggested by the assistant when someone says 'we always do it this way'. A suggested rule stays proposed until an admin turns it on.",
    ],
  },
  {
    slug: "the-assistant-never-approves", cat: "ai-in-practice", date: "2026-09-30", read: 3, seed: 53,
    title: "The assistant never approves",
    excerpt: "Lintel's assistant can read the model, run checks and draft changes. It has no button that says yes, by design.",
    body: [
      "Ask Lintel's assistant to widen the WC door and it will read the model, check your rule, and draft the change. Then it stops and tells you the change is waiting for approval.",
      "That is not a setting. The assistant's tools are read, check and propose. Approval is a state change on the server that only a person with the right role can make.",
      "## Why we built it this way",
      "Drawings carry professional responsibility. An edit that lands without a person deciding it is an edit nobody owns. Keeping the assistant on the proposing side means every change in the audit log has a name next to the word approved.",
      "It also makes the assistant safer to use. A model that cannot act on its own can be asked anything.",
    ],
  },
  {
    slug: "reading-the-audit-log", cat: "drawing-workflows", date: "2026-09-23", read: 4, seed: 67,
    title: "Reading the audit log in a client meeting",
    excerpt: "When a client asks why a wall moved, the answer should be a row, not a recollection.",
    body: [
      "Lintel writes every sync, proposal, approval, applied edit and revert to an audit log, with who did it and when.",
      "Most of the time nobody reads it. Then a client asks why a room got smaller between issue B and issue C, and the log becomes the most useful page in the project.",
      "## What a good answer looks like",
      "Filter by the room, find the change set, and the row shows the rule that flagged it, the values before and after, the person who approved it, and the time the plugin applied it. Export it as CSV if they want a copy.",
      "> A decision with a name and a time is a decision you can stand behind.",
      "Reverts are logged too, so a change that was undone tells the same complete story.",
    ],
  },
  {
    slug: "travel-distance-is-a-graph", cat: "drawing-workflows", date: "2026-09-16", read: 5, seed: 79,
    title: "Travel distance is a graph problem",
    excerpt: "How Lintel estimates exit access travel distance from doors and rooms, and where the estimate stops being reliable.",
    body: [
      "Exit access travel distance is one of the checks people most want automated and least trust when it is. So here is exactly what Lintel does.",
      "It treats doors as points on a graph. Two doors that open into the same room are joined by a straight line across that room. Exit doors are the destinations. The travel distance for a room is the worst case from any corner of that room to the nearest exit along that graph.",
      "## Where the estimate is honest",
      "For rectangular rooms and simple corridors the estimate is close. For L-shaped rooms, or rooms with fixed furniture, straight lines underestimate the real path, and we say so in the issue rather than hide it.",
      "> An approximation you understand is more useful than a precise number you can't check.",
      "Travel distance issues are always advice only. Lintel will tell you which room is over and by how much, but it will not guess which wall to move.",
    ],
  },
  {
    slug: "two-approvals", cat: "ai-in-practice", date: "2026-09-09", read: 3, seed: 83,
    title: "When one approval isn't enough",
    excerpt: "Two-approval mode for firms that want a second set of eyes before anything reaches the model.",
    body: [
      "Some changes are small enough for one approver. Others, on hospital or school work, a firm wants two people to see.",
      "With two-approval mode on, a change set needs two different approvers before the plugin applies it. The first approval is recorded and the queue shows one of two. Approving twice yourself still counts once.",
      "## Same queue, one more signature",
      "Nothing else changes. Proposals arrive in the same queue, comments sit with the change, and the audit log records both approvals with their times.",
    ],
  },
  {
    slug: "sample-clinic", cat: "field-notes", date: "2026-09-02", read: 4, seed: 97,
    title: "What the sample clinic teaches",
    excerpt: "Nine issues in nineteen elements. A short tour of the model every new Lintel firm can load in one click.",
    body: [
      "Every new firm in Lintel can load the sample clinic: a single-storey plan with a lobby, a long corridor, exam rooms, an accessible WC, an on-call room and an office.",
      "It is small on purpose. Nineteen elements, nine issues against the starter rules, and every kind of issue Lintel knows how to find.",
      "## What you'll see",
      "Two doors under the minimum clear width, both fixable in one click. A stair whose riser is too tall, where the fix recalculates the riser count. A corridor narrower than required and two rooms beyond the travel distance limit, all advice only. Two rooms under area, one by a firm standard rather than a code value.",
      "> Propose the door fix, approve it, and watch the issue disappear on the next sync.",
      "Then revert it and watch the log tell the whole story backwards.",
    ],
  },
];
