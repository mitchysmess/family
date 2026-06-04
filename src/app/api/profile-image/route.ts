import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const bucketName = "profile-images";
const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const image = formData?.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "Kies een afbeelding om te uploaden." },
      { status: 400 },
    );
  }

  if (!allowedImageTypes.includes(image.type)) {
    return NextResponse.json(
      { error: "Gebruik een JPG, PNG of WebP afbeelding." },
      { status: 400 },
    );
  }

  if (image.size > maxImageSize) {
    return NextResponse.json(
      { error: "Gebruik een afbeelding kleiner dan 2 MB." },
      { status: 400 },
    );
  }

  const client = getSupabaseServerClient();
  await ensureProfileImageBucket();

  const fileExtension = getFileExtension(image);
  const filePath = `${crypto.randomUUID()}.${fileExtension}`;
  const { error } = await client.storage
    .from(bucketName)
    .upload(filePath, image, {
      contentType: image.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: "Afbeelding uploaden is mislukt." },
      { status: 500 },
    );
  }

  const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
  return NextResponse.json({ avatarUrl: data.publicUrl });

  async function ensureProfileImageBucket() {
    const { data } = await client.storage.getBucket(bucketName);

    if (data) {
      return;
    }

    await client.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: maxImageSize,
      allowedMimeTypes: allowedImageTypes,
    });
  }
}

function getFileExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}
