# DoniVerse approval email notifications

This feature emails confirmed DoniVerse accounts when a new event or community becomes approved.

## 1. Run the SQL

Run `supabase/email-notifications.sql` in the Supabase SQL editor.

## 2. Deploy the Edge Function

Deploy:

```bash
supabase functions deploy broadcast-approved-content
```

The function uses the built-in Supabase server secrets plus these additional secrets:

```bash
supabase secrets set BREVO_API_KEY="YOUR_BREVO_API_KEY"
supabase secrets set BREVO_SENDER_EMAIL="YOUR_VERIFIED_SENDER_EMAIL"
supabase secrets set BREVO_SENDER_NAME="DoniVerse"
supabase secrets set DONIVERSE_APP_URL="https://YOUR-LIVE-DONIVERSE-DOMAIN"
```

`BREVO_SENDER_EMAIL` must be a sender/domain already verified in Brevo.

## 3. Create two Supabase Database Webhooks

In Supabase Dashboard → Database → Webhooks, create both webhooks below.

### Event approval webhook

- Name: `doniverse-event-approval-email`
- Table: `public.events`
- Events: `INSERT` and `UPDATE`
- Webhook target: Supabase Edge Function
- Function: `broadcast-approved-content`
- Method: `POST`
- Add the service-role authorization header using the Supabase Dashboard option for the service key.

### Community approval webhook

- Name: `doniverse-community-approval-email`
- Table: `public.communities`
- Events: `INSERT` and `UPDATE`
- Webhook target: Supabase Edge Function
- Function: `broadcast-approved-content`
- Method: `POST`
- Add the service-role authorization header using the Supabase Dashboard option for the service key.

The function ignores ordinary edits. It only broadcasts when content first changes into `approved` status (or is inserted already approved).

## 4. What users receive

### Approved event

The email includes:

- event title and poster when available
- date/time
- venue and organiser
- `Check out the event` button
- `Add to calendar` button

The calendar button downloads a standard `.ics` calendar event from `/api/calendar/event/[id]`, which works with common calendar apps.

### Approved community

The email includes:

- community name and image when available
- category, description and location
- `Check out this community` button linking to its DoniVerse detail page

## Delivery notes

- Only accounts with a confirmed email are included, which reduces bounces and protects sender reputation.
- Recipient addresses are sent as separate Brevo message versions, so students do not see one another's email addresses.
- `notification_broadcasts` prevents the same event/community from being broadcast twice.
- Brevo account limits/credits still apply.
