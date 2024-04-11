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
  const [openQR, setOpenQR] = useState(false);
  const [fid, setFid]: any = useState();
  const [signerId, setSignerId]: any = useState();

  async function checkStorage() {
    try {
      if (typeof window != "undefined") {
        const signer = localStorage.getItem("signer_id");
        console.log("local storage: ", signer);
        if (signer != null) {
          setSignerId(signer);
        } else {
          const signerReq = await fetch(`/api/signer?fid=${fid}`)
          const signerRes = await signerReq.json()
          setSignerId(signerRes.signers[0].signer_uuid)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

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
      setOpenQR(true);

      const pollReq = await fetch(`/api/poll?token=${signerRes.token}`);
      const pollRes = await pollReq.json();
      const pollStartTime = Date.now();
      while (pollRes.state != "completed") {
        if (Date.now() - pollStartTime > 120000) {
          console.log("Polling timeout reached");
          alert("Request timed out");
          setOpenQR(false);
          break;
        }
        const pollReq = await fetch(`/api/poll?token=${signerRes.token}`);
        const pollRes = await pollReq.json();
        if (pollRes.state === "completed") {
          setDeepLink(null);
          setOpenQR(false);
          setSignerId(signerRes.signer_id);
          localStorage.setItem("signer_id", signerRes.signer_id);
          return pollRes;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function sendCast() {
    try {
      const castReq = await fetch(`/api/cast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signerId: signerId }),
      });
      const castRes = await castReq.json();
      console.log(castRes);
      alert("Cast sent!")
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthKitProvider config={config}>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24 w-full">
        <SignInButton
          onSuccess={({ fid, username }) =>
            console.log(
              `Hello, ${username}! Your fid is ${fid}.`,
              setFid(fid),
              checkStorage(),
            )
          }
        />
        {!signerId && fid && (
          <button
            className="h-10 px-4 py-2 bg-black text-white hover:bg-black/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={createSigner}
          >
            Create Signer
          </button>
        )}
        {openQR && (
          <QRCode
            value={deepLink}
            size={200}
            logoImage="https://dweb.mypinata.cloud/ipfs/QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng"
            logoWidth={50}
            logoHeight={50}
            logoPadding={5}
            logoPaddingStyle="square"
            qrStyle="dots"
            eyeRadius={15}
          />
        )}
        {signerId && (
          <button
            className="h-10 px-4 py-2 bg-black text-white hover:bg-black/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={sendCast}
          >
            Cast "Hello World!" to /pinata
          </button>
        )}
      </main>
    </AuthKitProvider>
  );
}
