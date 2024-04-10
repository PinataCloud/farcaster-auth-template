import { NextResponse, NextRequest } from "next/server";
import { PinataFDK } from "pinata-fdk";

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT as string,
  pinata_gateway: "",
  appFid: process.env.APP_FID as string,
  appMnemonic: process.env.DEVELOPER_MNEMONIC,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token: any = searchParams.get("token");
    const res = await fdk.pollSigner(token);
    console.log(res)
    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
