"use server"

import { NextResponse, NextRequest } from "next/server";
import { PinataFDK } from "pinata-fdk";

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT as string,
  pinata_gateway: "",
  app_fid: process.env.APP_FID as string,
  app_mnemonic: process.env.DEVELOPER_MNEMONIC,
});

export async function POST() {
  try {
    const res = await fdk.createSponsoredSigner();
    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid: any = searchParams.get("fid");
    const res = await fdk.getSigners(fid);
    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
