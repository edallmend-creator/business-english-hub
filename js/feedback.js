(function () {
  const config = window.BE4W_SITE_CONFIG || {};
  const campaignKey = config.currentCampaign;
  const campaign = (config.campaigns && config.campaigns[campaignKey]) || {};

  const bookTitle = campaign.bookTitle || "Business English in 4 Wochen";
  const amazonReviewUrl = campaign.amazonReviewUrl;
  const feedbackEmail = campaign.feedbackEmail;

  const feedbackBody = [
    "Hallo Edgar,",
    "",
    "ich möchte kurz Feedback zum Buch geben:",
    "",
    "Was mir aufgefallen ist:",
    "...",
    "",
    "Viele Grüße"
  ].join("\n");

  const reviewLink = document.getElementById("amazonReviewLink");
  if (reviewLink && amazonReviewUrl) {
    reviewLink.href = amazonReviewUrl;
    reviewLink.setAttribute("aria-label", `Rezension zu ${bookTitle} auf Amazon schreiben`);
  } else if (reviewLink) {
    reviewLink.setAttribute("aria-disabled", "true");
  }

  const feedbackLink = document.getElementById("feedbackMailLink");
  if (feedbackLink && feedbackEmail) {
    const subject = encodeURIComponent("Feedback zum Buch");
    const body = encodeURIComponent(feedbackBody);
    feedbackLink.href = `mailto:${feedbackEmail}?subject=${subject}&body=${body}`;
    feedbackLink.setAttribute("aria-label", `Feedback zu ${bookTitle} per E-Mail senden`);
  } else if (feedbackLink) {
    feedbackLink.setAttribute("aria-disabled", "true");
  }
})();
