"use client";

import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { SignInButton } from "@farcaster/auth-kit";
import { QRCode } from "react-qrcode-logo";
import { useState } from "react";

const config = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
};

export default function Home() {
  const [deepLink, setDeepLink]: any = useState();

  async function createSigner() {
    try {
      const signerReq = await fetch(`/api/signer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const signerRes = await signerReq.json();
      setDeepLink(signerRes.deep_link_url);

      const pollReq = await fetch(`/api/signer?token=${signerRes.token}`);
      const pollRes = await pollReq.json();
      console.log(pollRes)
      while (pollRes.state != "complete") {
        const pollReq = await fetch(`/api/signer?token=${signerRes.token}`);
        const pollRes = await pollReq.json();
        if(pollRes.state === "complete"){
          console.log(pollRes)
          setDeepLink(null)
          return pollRes
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthKitProvider config={config}>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24 w-full">
        <SignInButton
          onSuccess={({ fid, username }) =>
            console.log(`Hello, ${username}! Your fid is ${fid}.`)
          }
        />
        <button onClick={createSigner}>Create Signer</button>
        {deepLink && (
        <QRCode
          value={deepLink}
          size={200}
          logoImage="https://dweb.mypinata.cloud/ipfs/QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng"
          logoWidth={50}
          logoHeight={50}
          logoPadding={5}
          logoPaddingStyle="square"
          fgColor="#7C65C1"
          qrStyle="dots"
          eyeRadius={15}
        />
        )}
      </main>
    </AuthKitProvider>
  );
}
