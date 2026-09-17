import { createClient } from "npm:@supabase/supabase-js@2";

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: "events" | "communities";
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

type Recipient = {
  id: string;
  email: string;
  name: string;
};

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const MAX_BATCH_SIZE = 900;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(value: unknown, max = 520) {
  const text = String(value ?? "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function formatEventDate(startValue: unknown, endValue: unknown) {
  const start = new Date(String(startValue));
  const end = endValue ? new Date(String(endValue)) : null;
  const date = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endTime = end
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "numeric",
        minute: "2-digit",
      }).format(end)
    : null;

  return `${date} · ${startTime}${endTime ? ` – ${endTime}` : ""}`;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function eventEmail(record: Record<string, unknown>, appUrl: string) {
  const id = String(record.id);
  const title = String(record.title ?? "Campus event");
  const description = truncate(record.description);
  const venue = String(record.venue_name ?? "").trim();
  const organiser = String(record.organizer_name ?? "").trim();
  const imageUrl = String(record.image_url ?? "").trim();
  const eventUrl = `${appUrl}/discover/event/${id}`;
  const calendarUrl = `${appUrl}/api/calendar/event/${id}`;
  const when = formatEventDate(record.starts_at, record.ends_at);

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#eef4ef;font-family:Arial,sans-serif;color:#102017">
    <div style="max-width:620px;margin:0 auto;padding:28px 16px">
      <div style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dce9df">
        ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" style="display:block;width:100%;max-height:390px;object-fit:cover">` : ""}
        <div style="padding:28px">
          <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#397151">New on DoniVerse</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.08">${escapeHtml(title)}</h1>
          <p style="margin:14px 0 0;color:#506057;line-height:1.65">Hi {{params.firstName}}, a newly approved campus event is now live on DoniVerse.</p>
          ${description ? `<p style="margin:16px 0 0;color:#506057;line-height:1.65">${escapeHtml(description)}</p>` : ""}
          <div style="margin-top:20px;padding:18px;border-radius:16px;background:#f3f8f4">
            <div style="font-weight:800">${escapeHtml(when)}</div>
            ${venue ? `<div style="margin-top:7px;color:#506057">📍 ${escapeHtml(venue)}</div>` : ""}
            ${organiser ? `<div style="margin-top:7px;color:#506057">Hosted by ${escapeHtml(organiser)}</div>` : ""}
          </div>
          <div style="margin-top:22px">
            <a href="${eventUrl}" style="display:inline-block;margin:0 8px 10px 0;padding:13px 18px;border-radius:14px;background:#174d31;color:#fff;text-decoration:none;font-weight:800">Check out the event</a>
            <a href="${calendarUrl}" style="display:inline-block;margin:0 0 10px;padding:13px 18px;border-radius:14px;background:#dff3e5;color:#174d31;text-decoration:none;font-weight:800">Add to calendar</a>
          </div>
          <p style="margin:18px 0 0;font-size:12px;color:#7b877f;line-height:1.6">DoniVerse · Your whole campus world, in one place.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return {
    subject: `New event on DoniVerse: ${title}`,
    html,
    title,
  };
}

function communityEmail(record: Record<string, unknown>, appUrl: string) {
  const id = String(record.id);
  const name = String(record.name ?? "Campus community");
  const description = truncate(record.description);
  const category = String(record.category ?? "community");
  const location = String(record.location_name ?? "").trim();
  const imageUrl = String(record.image_url ?? "").trim();
  const communityUrl = `${appUrl}/discover/community/${id}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#eef4ef;font-family:Arial,sans-serif;color:#102017">
    <div style="max-width:620px;margin:0 auto;padding:28px 16px">
      <div style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dce9df">
        ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" style="display:block;width:100%;max-height:390px;object-fit:cover">` : ""}
        <div style="padding:28px">
          <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#397151">New DoniVerse Community</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.08">${escapeHtml(name)}</h1>
          <p style="margin:14px 0 0;color:#506057;line-height:1.65">Hi {{params.firstName}}, check out this newly approved ${escapeHtml(category)} community on DoniVerse.</p>
          ${description ? `<p style="margin:16px 0 0;color:#506057;line-height:1.65">${escapeHtml(description)}</p>` : ""}
          ${location ? `<div style="margin-top:20px;padding:18px;border-radius:16px;background:#f3f8f4;font-weight:700">📍 ${escapeHtml(location)}</div>` : ""}
          <div style="margin-top:22px">
            <a href="${communityUrl}" style="display:inline-block;padding:13px 18px;border-radius:14px;background:#174d31;color:#fff;text-decoration:none;font-weight:800">Check out this community</a>
          </div>
          <p style="margin:18px 0 0;font-size:12px;color:#7b877f;line-height:1.6">DoniVerse · Your whole campus world, in one place.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return {
    subject: `New community on DoniVerse: ${name}`,
    html,
    title: name,
  };
}

async function listRecipients(supabaseAdmin: ReturnType<typeof createClient>) {
  const recipients: Recipient[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;

    for (const user of data.users) {
      if (!user.email || !user.email_confirmed_at) continue;
      const fullName = String(user.user_metadata?.full_name ?? "").trim();
      recipients.push({
        id: user.id,
        email: user.email,
        name: fullName,
      });
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return recipients;
}

async function sendBrevoBatch({
  apiKey,
  senderEmail,
  senderName,
  subject,
  html,
  recipients,
  idempotencyKey,
}: {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  html: string;
  recipients: Recipient[];
  idempotencyKey: string;
}) {
  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      subject,
      htmlContent: html,
      headers: { idempotencyKey },
      messageVersions: recipients.map((recipient) => ({
        to: [{ email: recipient.email, name: recipient.name || undefined }],
        params: {
          firstName: recipient.name?.split(/\s+/)[0] || "there",
        },
      })),
      tags: ["doniverse-approval-notification"],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Brevo ${response.status}: ${JSON.stringify(body)}`);
  }

  return body as { messageIds?: string[]; messageId?: string };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "DoniVerse";
  const appUrl = (Deno.env.get("DONIVERSE_APP_URL") || "").replace(/\/$/, "");

  if (!supabaseUrl || !serviceRoleKey || !brevoApiKey || !senderEmail || !appUrl) {
    return Response.json(
      { error: "Missing notification environment variables" },
      { status: 500 },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const record = payload.record;
  const oldRecord = payload.old_record;

  if (!record || !["events", "communities"].includes(payload.table)) {
    return Response.json({ skipped: true, reason: "Unsupported webhook" });
  }

  if (record.status !== "approved" || oldRecord?.status === "approved") {
    return Response.json({ skipped: true, reason: "Not a new approval" });
  }

  const contentKind = payload.table === "events" ? "event" : "community";
  const contentId = String(record.id);
  const email = contentKind === "event" ? eventEmail(record, appUrl) : communityEmail(record, appUrl);

  const { data: broadcast, error: claimError } = await supabaseAdmin
    .from("notification_broadcasts")
    .insert({
      content_kind: contentKind,
      content_id: contentId,
      title: email.title,
      status: "sending",
    })
    .select("id")
    .single();

  if (claimError) {
    if (claimError.code === "23505") {
      return Response.json({ skipped: true, reason: "Already broadcast" });
    }
    return Response.json({ error: claimError.message }, { status: 500 });
  }

  try {
    const recipients = await listRecipients(supabaseAdmin);

    if (!recipients.length) {
      await supabaseAdmin
        .from("notification_broadcasts")
        .update({ status: "sent", recipients_count: 0, sent_at: new Date().toISOString() })
        .eq("id", broadcast.id);
      return Response.json({ ok: true, recipients: 0 });
    }

    const batches = chunk(recipients, MAX_BATCH_SIZE);
    const batchKeys = batches.map(() => crypto.randomUUID());
    await supabaseAdmin
      .from("notification_broadcasts")
      .update({ batch_keys: batchKeys })
      .eq("id", broadcast.id);

    const messageIds: string[] = [];

    for (let index = 0; index < batches.length; index += 1) {
      const result = await sendBrevoBatch({
        apiKey: brevoApiKey,
        senderEmail,
        senderName,
        subject: email.subject,
        html: email.html,
        recipients: batches[index],
        idempotencyKey: batchKeys[index],
      });
      if (result.messageIds) messageIds.push(...result.messageIds);
      if (result.messageId) messageIds.push(result.messageId);
    }

    await supabaseAdmin
      .from("notification_broadcasts")
      .update({
        status: "sent",
        recipients_count: recipients.length,
        provider_message_ids: messageIds,
        sent_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", broadcast.id);

    return Response.json({ ok: true, recipients: recipients.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification broadcast failed";
    await supabaseAdmin
      .from("notification_broadcasts")
      .update({ status: "failed", error_message: message.slice(0, 2000) })
      .eq("id", broadcast.id);

    return Response.json({ error: message }, { status: 500 });
  }
});
