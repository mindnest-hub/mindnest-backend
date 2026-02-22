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

## 3. Customize Email Templates (Optional)
If you want to further personalize the welcome message:

1.  Go to **Authentication** > **Email Templates**.
2.  Under **Confirm Signup**, you can edit the HTML/Text to fit your brand.
3.  Click **Save**.

---

> [!NOTE]
> The backend is now configured to notify you (via server logs) whenever a new user successfully signs up. In production, this can be extended to send you an email or a Slack alert.
