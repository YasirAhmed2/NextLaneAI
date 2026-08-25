"""
services/notification_service.py — NextLane AI
===============================================
Proactive email notification system for autonomous deadline alerting.

Features:
  - send_deadline_alert()  → HTML email for opportunities closing within 24h
  - send_agent_digest()    → Weekly digest of top-matched opportunities
  - send_welcome_email()   → New user onboarding email

Uses Python stdlib smtplib + email.mime for zero extra dependencies.
Falls back gracefully if SMTP config is missing — never crashes the agent.
"""
import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("nextlane_ai")


# ── Email HTML Templates ──────────────────────────────────────────────────────

_URGENT_EMAIL_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NextLane AI — Urgent Deadline Alert</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f14; color: #e0e0e0; }}
  .wrapper {{ max-width: 620px; margin: 0 auto; padding: 20px; }}
  .header {{ background: linear-gradient(135deg, #6c47ff 0%, #a855f7 100%);
             border-radius: 16px 16px 0 0; padding: 32px 28px; text-align: center; }}
  .header h1 {{ color: #fff; font-size: 22px; margin-bottom: 6px; }}
  .header p {{ color: rgba(255,255,255,0.85); font-size: 14px; }}
  .badge {{ display: inline-block; background: #ff4d4d; color: white;
            font-size: 12px; font-weight: 700; padding: 4px 12px;
            border-radius: 20px; margin-bottom: 12px; }}
  .body {{ background: #1a1a2e; padding: 28px; border-radius: 0 0 16px 16px; }}
  .greeting {{ font-size: 16px; margin-bottom: 20px; color: #c0c0d0; }}
  .opp-card {{ background: #16213e; border: 1px solid #6c47ff44;
               border-left: 4px solid #ff4d4d; border-radius: 10px;
               padding: 18px 20px; margin-bottom: 14px; }}
  .opp-title {{ font-size: 16px; font-weight: 700; color: #e8e0ff; margin-bottom: 4px; }}
  .opp-org {{ font-size: 13px; color: #a89de0; margin-bottom: 8px; }}
  .opp-deadline {{ font-size: 12px; color: #ff6b6b; font-weight: 600;
                   background: #ff4d4d18; padding: 3px 10px; border-radius: 6px;
                   display: inline-block; margin-bottom: 10px; }}
  .opp-type {{ font-size: 11px; color: #8b5cf6; font-weight: 600;
               background: #8b5cf620; padding: 2px 8px; border-radius: 4px;
               display: inline-block; margin-left: 6px; }}
  .apply-btn {{ display: inline-block; background: linear-gradient(135deg, #6c47ff, #a855f7);
                color: white; text-decoration: none; padding: 9px 20px;
                border-radius: 8px; font-size: 13px; font-weight: 600;
                margin-top: 6px; }}
  .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #555; }}
  .cta-section {{ text-align: center; margin: 24px 0; }}
  .cta-btn {{ display: inline-block; background: #6c47ff; color: white;
              text-decoration: none; padding: 12px 28px; border-radius: 10px;
              font-size: 15px; font-weight: 700; }}
  .divider {{ border: none; border-top: 1px solid #2a2a3e; margin: 20px 0; }}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="badge">⚡ URGENT DEADLINE ALERT</div>
    <h1>NextLane AI — Don't Miss Out!</h1>
    <p>Your autonomous agent detected {count} opportunity closing within 24 hours</p>
  </div>
  <div class="body">
    <p class="greeting">Hey <strong>{username}</strong>,</p>
    <p style="margin-bottom:20px; color:#9090a0; font-size:14px;">
      Your NextLane AI agent is watching your deadlines 24/7. 
      Here's what's closing <strong style="color:#ff6b6b;">very soon</strong> — act now before it's too late:
    </p>
    {opportunity_cards}
    <hr class="divider">
    <div class="cta-section">
      <a href="{dashboard_url}" class="cta-btn">🚀 Open NextLane Dashboard</a>
    </div>
    <p style="font-size:12px; color:#555; text-align:center; margin-top:16px;">
      This alert was automatically sent by your NextLane AI agent.<br>
      The agent runs autonomously every 30 minutes checking for new opportunities.
    </p>
  </div>
  <div class="footer">
    NextLane AI — Autonomous Opportunity Gap Agent<br>
    <span style="color:#333;">Powered by Gemini AI + Google Cloud</span>
  </div>
</div>
</body>
</html>
"""

_OPP_CARD_TEMPLATE = """\
<div class="opp-card">
  <div class="opp-title">{title}</div>
  <div class="opp-org">🏢 {organization}</div>
  <span class="opp-deadline">⏰ Deadline: {deadline}</span>
  <span class="opp-type">{opp_type}</span>
  <br>
  <a href="{url}" class="apply-btn">Apply Now →</a>
</div>
"""

_DIGEST_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NextLane AI — Weekly Opportunity Digest</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f14; color: #e0e0e0; }}
  .wrapper {{ max-width: 620px; margin: 0 auto; padding: 20px; }}
  .header {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
             border: 1px solid #6c47ff44; border-radius: 16px 16px 0 0;
             padding: 32px 28px; text-align: center; }}
  .header h1 {{ color: #e8e0ff; font-size: 22px; margin-bottom: 6px; }}
  .body {{ background: #1a1a2e; padding: 28px; border-radius: 0 0 16px 16px; }}
  .match-card {{ background: #16213e; border: 1px solid #6c47ff44;
                 border-left: 4px solid #6c47ff; border-radius: 10px;
                 padding: 16px 18px; margin-bottom: 12px; }}
  .match-score {{ font-size: 22px; font-weight: 800; color: #a855f7; float: right; }}
  .match-title {{ font-size: 15px; font-weight: 700; color: #e8e0ff; margin-bottom: 3px; }}
  .match-org {{ font-size: 12px; color: #a89de0; margin-bottom: 8px; }}
  .match-reason {{ font-size: 12px; color: #888; font-style: italic; margin-bottom: 10px; }}
  .apply-link {{ color: #8b5cf6; text-decoration: none; font-size: 13px; font-weight: 600; }}
  .footer {{ text-align:center; padding:20px; font-size:12px; color:#555; }}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🎯 Your Weekly Opportunity Digest</h1>
    <p style="color:#8080a0; font-size:13px; margin-top:8px;">
      NextLane AI found {count} high-match opportunities for you this week
    </p>
  </div>
  <div class="body">
    <p style="margin-bottom:20px; color:#9090a0; font-size:14px;">
      Hey <strong style="color:#e8e0ff;">{username}</strong>, here are your top AI-matched opportunities:
    </p>
    {match_cards}
    <p style="font-size:12px; color:#444; text-align:center; margin-top:20px;">
      Scores generated by Gemini AI based on your profile and skills.
    </p>
  </div>
  <div class="footer">NextLane AI · Powered by Gemini + Google Cloud</div>
</div>
</body>
</html>
"""

_MATCH_CARD_TEMPLATE = """\
<div class="match-card">
  <span class="match-score">{score}%</span>
  <div class="match-title">{title}</div>
  <div class="match-org">{organization} · {opp_type}</div>
  <div class="match-reason">"{reason}"</div>
  <a href="{url}" class="apply-link">View & Apply →</a>
</div>
"""


# ── Notification Service ──────────────────────────────────────────────────────

class NotificationService:
    """
    Proactive email notification service for NextLane AI.

    Configured via environment variables:
      EMAIL_USER — Gmail address (sender)
      EMAIL_PASS — Gmail App Password (16-char, no spaces)
      DASHBOARD_URL — Frontend URL for CTA links

    If config is missing, all methods return False gracefully.
    """

    def __init__(self):
        self.email_user: str = os.getenv("EMAIL_USER", "")
        self.email_pass: str = os.getenv("EMAIL_PASS", "").replace(" ", "")
        self.dashboard_url: str = os.getenv(
            "DASHBOARD_URL", "http://localhost:5000"
        )
        self._enabled = bool(self.email_user and self.email_pass)
        if not self._enabled:
            logger.warning(
                "[NOTIFICATION] EMAIL_USER or EMAIL_PASS not set — "
                "email alerts disabled. Set them in .env to enable."
            )
        else:
            logger.info(
                "[NOTIFICATION] Email service ready — sender: %s", self.email_user
            )

    # ── Internal SMTP send ────────────────────────────────────────────────────

    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: str = "",
    ) -> bool:
        """
        Sends an HTML email via Gmail SMTP SSL.
        Returns True on success, False on any failure.
        """
        if not self._enabled:
            logger.info(
                "[NOTIFICATION] Email disabled — would have sent '%s' to %s",
                subject, to_email
            )
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"NextLane AI <{self.email_user}>"
            msg["To"] = to_email
            msg["X-Mailer"] = "NextLane-AI/2.0"

            # Plain text fallback
            if not text_body:
                text_body = "Please view this email in an HTML-capable client."
            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
                server.login(self.email_user, self.email_pass)
                server.sendmail(self.email_user, to_email, msg.as_string())

            logger.info(
                "[NOTIFICATION] ✅ Email sent — subject='%s' to=%s", subject, to_email
            )
            return True

        except smtplib.SMTPAuthenticationError:
            logger.error(
                "[NOTIFICATION] ❌ SMTP auth failed — check EMAIL_USER/EMAIL_PASS"
            )
            return False
        except smtplib.SMTPRecipientsRefused:
            logger.error("[NOTIFICATION] ❌ Recipient refused: %s", to_email)
            return False
        except smtplib.SMTPException as e:
            logger.error("[NOTIFICATION] ❌ SMTP error: %s", str(e))
            return False
        except Exception as e:
            logger.error("[NOTIFICATION] ❌ Unexpected error sending email: %s", str(e))
            return False

    # ── Public API ────────────────────────────────────────────────────────────

    def send_deadline_alert(
        self,
        to_email: str,
        username: str,
        urgent_opps: List[Dict[str, Any]],
    ) -> bool:
        """
        Sends an urgent deadline alert email for opportunities closing within 24h.

        Args:
            to_email:    Recipient email address.
            username:    Display name for greeting.
            urgent_opps: List of opportunity dicts with title, organization,
                         deadline, url, type fields.

        Returns:
            True if email sent successfully, False otherwise.
        """
        if not urgent_opps:
            return False

        # Build opportunity cards
        cards_html = ""
        text_lines = [
            f"NextLane AI — Urgent Deadline Alert",
            f"Hey {username}, {len(urgent_opps)} opportunities are closing within 24 hours!\n",
        ]

        for opp in urgent_opps[:8]:  # cap at 8 per email
            title = opp.get("title", "Opportunity")
            org = opp.get("organization", "")
            deadline = opp.get("deadline", "Soon")
            url = opp.get("url", self.dashboard_url)
            opp_type = opp.get("type", "Opportunity")

            cards_html += _OPP_CARD_TEMPLATE.format(
                title=title,
                organization=org,
                deadline=deadline,
                opp_type=opp_type,
                url=url,
            )
            text_lines.append(f"• {title} ({org}) — {deadline}\n  Apply: {url}\n")

        html_body = _URGENT_EMAIL_TEMPLATE.format(
            count=len(urgent_opps),
            username=username,
            opportunity_cards=cards_html,
            dashboard_url=self.dashboard_url,
        )

        subject = (
            f"⏰ {len(urgent_opps)} Opportunit{'y' if len(urgent_opps) == 1 else 'ies'} "
            f"Closing Within 24 Hours — NextLane AI"
        )

        return self._send_email(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            text_body="\n".join(text_lines),
        )

    def send_agent_digest(
        self,
        to_email: str,
        username: str,
        top_matches: List[Dict[str, Any]],
    ) -> bool:
        """
        Sends a weekly digest email with the user's top AI-matched opportunities.

        Args:
            to_email:    Recipient email address.
            username:    Display name for greeting.
            top_matches: List of matched opportunity dicts with matchScore,
                         aiMatchReason, title, organization, url, type.

        Returns:
            True if email sent successfully, False otherwise.
        """
        if not top_matches:
            return False

        cards_html = ""
        text_lines = [
            f"NextLane AI — Weekly Opportunity Digest",
            f"Hey {username}, here are your top {len(top_matches)} AI-matched opportunities:\n",
        ]

        for match in top_matches[:5]:
            score = match.get("matchScore", 0)
            reason = match.get("aiMatchReason", "Strong profile match")
            # Truncate reason for email
            if len(reason) > 120:
                reason = reason[:117] + "..."
            title = match.get("title", "Opportunity")
            org = match.get("organization", "")
            url = match.get("url", self.dashboard_url)
            opp_type = match.get("type", "Opportunity")

            cards_html += _MATCH_CARD_TEMPLATE.format(
                score=score,
                title=title,
                organization=org,
                opp_type=opp_type,
                reason=reason,
                url=url,
            )
            text_lines.append(f"• [{score}%] {title} — {org}\n  {reason}\n  {url}\n")

        html_body = _DIGEST_TEMPLATE.format(
            count=len(top_matches),
            username=username,
            match_cards=cards_html,
        )

        subject = f"🎯 Your Weekly NextLane AI Digest — {len(top_matches)} Opportunities Found"

        return self._send_email(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            text_body="\n".join(text_lines),
        )

    def send_welcome_email(self, to_email: str, username: str) -> bool:
        """Sends a welcome onboarding email to newly registered users."""
        html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Welcome to NextLane AI</title></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f14;color:#e0e0e0;padding:20px;">
<div style="max-width:580px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#6c47ff,#a855f7);border-radius:16px;
              padding:32px;text-align:center;margin-bottom:20px;">
    <h1 style="color:white;margin-bottom:8px;">🚀 Welcome to NextLane AI</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;">
      Your autonomous opportunity discovery agent is now active.
    </p>
  </div>
  <div style="background:#1a1a2e;border-radius:16px;padding:28px;">
    <p style="color:#c0c0d0;margin-bottom:16px;">Hey <strong>{username}</strong>,</p>
    <p style="color:#9090a0;font-size:14px;margin-bottom:20px;">
      Your NextLane AI agent is now configured and running. Here's what happens next:
    </p>
    <ul style="color:#9090a0;font-size:14px;padding-left:20px;line-height:1.8;">
      <li>🔍 Agent scrapes 8 real platforms every 30 minutes (Devpost, MLH, Unstop, RemoteOK &amp; more)</li>
      <li>🤖 Gemini AI scores every opportunity against your profile</li>
      <li>⏰ You'll receive alerts when deadlines are within 24 hours</li>
      <li>📊 Weekly digests with your top AI-matched opportunities</li>
    </ul>
    <div style="text-align:center;margin-top:24px;">
      <a href="{self.dashboard_url}" style="background:#6c47ff;color:white;text-decoration:none;
         padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px;">
        Open Your Dashboard →
      </a>
    </div>
  </div>
</div>
</body>
</html>
"""
        return self._send_email(
            to_email=to_email,
            subject="🚀 Welcome to NextLane AI — Your Agent is Active",
            html_body=html_body,
            text_body=f"Welcome to NextLane AI, {username}! Your autonomous opportunity agent is now active.",
        )

    @property
    def is_enabled(self) -> bool:
        """Returns True if email service is configured and ready."""
        return self._enabled


# ── Singleton ─────────────────────────────────────────────────────────────────
notification_service = NotificationService()
