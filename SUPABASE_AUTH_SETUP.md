# Supabase Auth Configuration Guide

To complete the customization of your authentication experience, please follow these steps in your Supabase Dashboard:

## 1. Change Sender Name
This will change "Supabase Auth" to "MindNest Verification" in the emails sent to users.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (**african-edu**).
3.  Go to **Authentication** > **Providers** > **Email**.
4.  Find the **Sender Name** field.
5.  Change it to: `MindNest Verification`
6.  Click **Save**.

## 2. Verify OTP Length
Ensure that the verification code is 6 digits long.

1.  In the same **Email** provider settings, look for **OTP Length**.
2.  Ensure it is set to `6`.
3.  Click **Save** if you made any changes.

## 3. Customize Email Branding (IMPORTANT for Waitlist)
To ensure users do not see "Supabase" anywhere, you must edit the email templates!

1. Go to **Authentication** > **Email Templates**.
2. Under **Confirm Signup**, change the **Subject** to: `Verify your MindNest Africa Account`
3. Edit the HTML body to say "Welcome to MindNest Africa!" instead of "Supabase".
4. *Crucial:* Ensure your **Site URL** (under URL Configuration) is set to `https://mindnest.bond` (or your live domain), so the button takes them to your website and not localhost.
5. Click **Save**.

---

> [!NOTE]
> The backend is now configured to notify you (via server logs) whenever a new user successfully signs up. In production, this can be extended to send you an email or a Slack alert.
