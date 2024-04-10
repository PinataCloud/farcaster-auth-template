import { NextResponse, NextRequest } from "next/server";
import { PinataFDK } from "pinata-fdk";

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT as string,
  pinata_gateway: "",
  appFid: process.env.APP_FID as string,
  appMnemonic: process.env.DEVELOPER_MNEMONIC as string,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fdk.sendCast({
      castAddBody: {
        text: "Hello World!",
        parentUrl: "https://warpcast.com/~/channel/pinata"
      },
      signerId: body.signerId
    });
    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
