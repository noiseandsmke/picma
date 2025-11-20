<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>PICMA Notification</title>
    <style>
        /* Reset styles */
        body, table, td, a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f4f4;
            line-height: 1.6;
        }

        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
        }

        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }

        /* Content */
        .email-content {
            padding: 40px 30px;
            color: #333333;
        }

        .email-content p {
            margin: 0 0 15px;
            font-size: 16px;
            line-height: 1.6;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #333333;
            margin-bottom: 20px;
        }

        /* Button */
        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .cta-button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        /* Info Box */
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #555555;
        }

        /* Footer */
        .email-footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 30px 20px;
            text-align: center;
            font-size: 14px;
        }

        .email-footer p {
            margin: 5px 0;
        }

        .email-footer a {
            color: #667eea;
            text-decoration: none;
        }

        .email-footer a:hover {
            text-decoration: underline;
        }

        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 25px 0;
        }

        .timestamp {
            color: #718096;
            font-size: 13px;
            margin-top: 20px;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }

            .email-content {
                padding: 30px 20px !important;
            }

            .email-header h1 {
                font-size: 24px !important;
            }

            .cta-button {
                padding: 12px 30px !important;
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
        <td align="center">
            <div class="email-container">
                <!-- Header -->
                <div class="email-header">
                    <h1>PICMA Notification</h1>
                </div>

                <!-- Content -->
                <div class="email-content">
                    <p class="greeting">Hello ${recipientEmail},</p>

                    <p>We hope this message finds you well. You have received this notification from PICMA Marketing
                        Center.</p>

                    <div class="info-box">
                        <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
                        <p><strong>To:</strong> ${recipientEmail}</p>
                        <#if recipientUserId??>
                            <p><strong>User ID:</strong> ${recipientUserId}</p>
                        </#if>
                    </div>

                    <p>Please review the latest updates and information by clicking the button below:</p>

                    <div class="button-container">
                        <a href="${viewLeadLink}" class="cta-button">View Lead Details</a>
                    </div>

                    <div class="divider"></div>

                    <p>If you have any questions or need assistance, please don't hesitate to reach out to our support
                        team.</p>

                    <p>Best regards,<br>
                        <strong>${fromName}</strong><br>
                        PICMA Marketing Team</p>

                    <p class="timestamp">Sent on: ${currentTime}</p>
                </div>

                <!-- Footer -->
                <div class="email-footer">
                    <p><strong>PICMA Marketing Center</strong></p>
                    <p>&copy; ${currentYear} PICMA. All rights reserved.</p>
                    <p>
                        <a href="${viewLeadLink}">View in Browser</a> |
                        <a href="#">Unsubscribe</a> |
                        <a href="#">Privacy Policy</a>
                    </p>
                    <p style="margin-top: 15px; font-size: 12px; color: #718096;">
                        This email was sent to ${recipientEmail}. If you believe this was sent in error, please contact
                        our support team.
                    </p>
                </div>
            </div>
        </td>
    </tr>
</table>
</body>
</html>