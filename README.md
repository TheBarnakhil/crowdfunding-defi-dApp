This is an Anchor and NextJS monorepo.

### The project is live at: https://crowdfunding-defi-d-app.vercel.app/ and the Anchor program is deployed on devnet : https://explorer.solana.com/address/6bGBwC51smQLwjUhB7Kp6ZTJwPDHMuDWgYzEiogGBtDi?cluster=devnet

# About

This project is an amatuer blockchain enthusiast's attempt at creating a crowdfunding dApp in which 
1) A user can connect his wallet which acts as an identity to connect to the dApp
2) A user can create a campaign which is essentially a PDA that can store funds that are donated
3) A user can donate / withdraw SOL or a special token, in this case FORGE.
4) A user can look at the list of campaigns and then donate to a cause they believe in
5) Only the campaign creator or admin should be able to withdraw the donation

# Roadmap
This project aims to not just stick with crowdfunding but also explore the potential of becoming a *Quadratic Funding DeFi dApp*, which is unheard of on the SOL chain

## Immediate improvements to be made
- The Anchor program needs valid test cases to make the code more robust and requires more error handling
- The Withdraw Forge function is not working due to an error, which I didn't have enough time to fix before the submission
- All the sensitive keys to be moved into an .env file
- Most of the logic to be moved into API calls to avoid exposing sensitive information to the user
- The FE app UI needs to be improved
- Loading skeletons need to be added to support the loading state of the lazy loading
- The flow of UI after abruptly disconnecting on the create and view screens needs to be handled
- Error boundaries and suspense boundaries need to be handled better
- The donate forge button will not work unless the special-token created is added to the user's wallet
- Adding toast messages to enhance the user experience


## Snippets

- ### Landing page

![image](https://github.com/TheBarnakhil/crowdfunding-defi-dApp/assets/39586134/0b772f7c-3b20-473c-9969-a68142892f68)

- ### After connecting to wallet

![image](https://github.com/TheBarnakhil/crowdfunding-defi-dApp/assets/39586134/2c387fb8-68d2-4f4e-acb2-3cba39384517)


- ### Creating a campaign succesfully

![image](https://github.com/TheBarnakhil/crowdfunding-defi-dApp/assets/39586134/f2c427e8-c4cd-427a-9741-4a2b97c3d8eb)


- ### View created campaigns

![image](https://github.com/TheBarnakhil/crowdfunding-defi-dApp/assets/39586134/dcc5da82-9bb7-41df-917a-0b60b8fbf745)










First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


