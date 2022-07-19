import mjml2html from "mjml";

/**
 * This is the template you should copy/paste into Converkit.
 * MJML inlines styles in our `htmlBody` which is why we need to copy/paste
 * that html once it goes through this template, not before.
 *
 * We return the component pieces of the email, as we need different parts
 * for different reason.
 *
 * https://mjml.io/try-it-live/6-5ER0LJy
 * @param {string?}
 * @returns {{ emailHtml: string, emailTemplate: string, emailBody: string }}
 */
export default function mjml(htmlBody = "") {
  let { html, /* json,*/ errors } = mjml2html(/*html*/ `<mjml>
    <mj-head>
      <mj-attributes>
        <!-- <mj-font name="Source Code Pro" href="https://fonts.googleapis.com/css2?family=Source+Code+Pro" /> -->
        <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700" />
        <mj-font name="Founders Grotesk" href="https://cdn.jim-nielsen.com/founders-grotesk.css" />
        <mj-text padding="0 16px" />
        <mj-image padding="0 16px" />
        <mj-all font-family="Inter, ui-sans-serif, sans-serif" font-size="16px" line-height="24px" />
      </mj-attributes>
      <mj-style>
        :root { color-scheme: light dark }
      </mj-style>
      <mj-style inline="inline">
        .prose h1,
        .prose h2 {
          font-family: "Founders Grotesk", Inter, ui-sans-serif, sans-serif; 
          font-size: 45px;
          line-height: 48px;
          margin-top: 32px;
          margin-bottom: 16px;
          font-weight: 900;
        }
        .prose h1 {
          margin-top: 0;
        }
        .prose img {
          box-sizing: border-box;
          transform: rotate(-.75deg);
          width: 100%;
          height: auto;
        }
        .prose h1 + p {
          font-size:18px;
          line-height:28px;
        }
        .prose a {
          color: inherit;
        }
        .prose hr {
          width: 48px;
          border: 4px solid;
          margin: 96px 0 24px 0;
          transform: rotate(-.75deg);
          background: currentColor;
        }
        .prose img {
          border-width: 8px;
          border-style: solid;
        }
        
        .prose blockquote {
          font-style: italic;
        }

        .prose blockquote em {
          font-style: normal;
        }
        
        /* @TODO other elements: table, pre, code, hr, etc. */
        
        /* Colors - alternate between remix brand colors */
        .prose hr:nth-of-type(2n+1),
        .prose hr:nth-of-type(2n+1) + p img {
          border-color: #3992ff;
          color: #3992ff;
        }
        
        .prose hr:nth-of-type(2n+2),
        .prose hr:nth-of-type(2n+2) + p img {
          border-color: #6bd968;
          color: #6bd968;
        }
        
        .prose hr:nth-of-type(2n+3),
        .prose hr:nth-of-type(2n+3) + p img {
          border-color: #cd8701;
          color: #cd8701;
        }
        
        .prose hr:nth-of-type(2n+4),
        .prose hr:nth-of-type(2n+4) + p img {
          border-color: #d83bd2;
          color: #d83bd2;
        }

        .prose hr:nth-of-type(2n+5),
        .prose hr:nth-of-type(2n+5) + p img {
          border-color: #f44250;
          color: #f44250;
        }
        
        .footer,
        .view-in-browser {
          opacity: .5;
        }
        .footer hr {
          transform: rotate(-.75deg);
          border: none;
          border-top: 1px solid;
          opacity: .25;
          padding-bottom: 16px;
        }
        .footer a {
          color: inherit;
        }

        .view-in-browser a {
          color: inherit;
        }
      </mj-style>
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text
            color="inherit"
            css-class="view-in-browser"
            font-size="14px"
            line-height="21px"
            padding-top="24px"
            align="right"
            color="inherit">
            <a href="{{ archive_url }}">View in browser</a>
          </mj-text>
          <mj-image
            alt="Remix logo"
            href="https://remix.run"
            src="https://user-images.githubusercontent.com/1316441/178366107-d3ef4ffa-ffa2-4c8f-bb11-8069def7962a.png"
            width="128px"
            align="left"
            target="_blank"
            padding-top="0px"
            padding-bottom="48px">
          </mj-image>
          <mj-text css-class="prose" color="inherit">
            <!-- <BODY_CONTENTS> -->${htmlBody}<!-- <BODY_CONTENTS> -->
          </mj-text>
        </mj-column>
      </mj-section>
      
      <mj-section>
        <mj-column>
          <mj-text css-class="footer" font-size="14px" line-height="21px" padding-top="96px" color="inherit">
            <hr>
            <p>Feedback? Email <a href="mailto:news@remix.run">news@remix.run</a> or hit reply to this email.</p>
            <p>548 Market St PMB 35453, San Francisco, CA 94104-5401</p>
            <p><a href="{{ unsubscribe_url }}">Unsubscribe</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="{{ subscriber_preferences_url }}">Update your preferences</a></p>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`);

  // Trim excess that MJML gives back
  html = html.trim();

  if (errors.length)
    console.error("Error encountered while parsing mjml template", errors);

  // We have to pull the stuff out of these tags, as these are the separate
  // pieces that get copy/pasted into Converkit
  const regex = /<!-- <BODY_CONTENTS> -->(.*)<!-- <BODY_CONTENTS> -->/s;

  // The _template_ that gets copy/pasted into Conevrtkit
  const emailTemplateHtml = html.replace(regex, "{{ message_content }}");

  // The _body_ that gets copy/pasted into each Convertkit broadcast
  const match = html.match(regex);
  const emailBodyHtml = match[1]; // We'll grab the stuff inside <BODY_CONTENTS>

  return { emailHtml: html, emailTemplateHtml, emailBodyHtml };
}
