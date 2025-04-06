// eslint-disable-next-line import/no-anonymous-default-export

const emailToUser = `Dear {{user_name}},

Thank you for trying Sally AI! 🙏 Over the past year, I’ve been working on integrating AI more deeply into our work, and I hope Sally has been valuable to you.

**⚠️Your 7-day trial has ended**. Upgrade now at a **special discounted price** to keep enjoying Sally’s full benefits. Your support helps improve Sally and keeps me building tools for users like you.

As a thank-you, I’m offering you two options to continue with Sally:

- 🔓 [**Upgrade now at a special price**](https://www.sally.bot/pricing)  
- 🎁 [**Write a review and earn an extra 7 Days free trial!**](https://www.sally.bot/earn-free-trial) 

Thank you again for being a part of the Sally AI journey. Your trust means everything! 🙌

Best regards,  
Eric  
Founder, Sally AI

Contact me:
- Whatsapp: [Whatsapp](https://wa.me/8619066504137)
- Email: sally-suite@hotmail.com
`

const tokenNotEnouph = `Dear {{user_name}},

Thank you for trying out Sally! As the founder, I’ve dedicated the past year to developing this tool after being laid off, and I hope it has been helpful.

Your trial credits have now run out. I invite you to continue using Sally by subscribing. Your support would mean a lot and help me improve Sally for users like you.

Thank you for your trust and feedback!

🌟[Upgrade your Plan](https://www.sally.bot/pricing) or 🎁[Earn a One-Month Free Trial](https://www.sally.bot/earn-free-trial) to keep going.
`

export const ErrorInfo = {
    'TokenNotEnough': 'Oops, looks like your credits are running out or your subscription has expired! 🌟[Upgrade your Plan](https://www.sally.bot/pricing) or 🎁[Earn 7-Day Free Trial](https://www.sally.bot/earn-free-trial) to keep going.',
    'TokenNotEnoughEmail': emailToUser,//'🌟[Upgrade your Plan](https://www.sally.bot/#pricing) or 🎁[Earn more Trial Credits](https://www.sally.bot/earn-free-trial) to keep going.',
    'VersionNotSupport': 'Oops, looks like your version is not supported. Please upgrade to the Pro version.',
    'TokenExpired': 'Looks like your token has expired. Please login again.',
    'UnAuthorized': "You're not authorized to access this resource. Please login again.",
    "ClaudeNotPro": 'Oops, looks like your version is not supported. Please upgrade to the Pro version.',
    "NotSupportModel": `Sorry, The current version you are using does not support this model, you can [Upgrade your Plan](https://www.sally.bot/pricing) to keep going.`,
    "CreditsNotEnough": "Sorry, you don't have enough credits."
}