import { getSupabaseBrowserClient } from "./supabase";

export const LISTING_PHOTOS_BUCKET = "listing-photos";

function fileExtension(name: string): string {
    const ext = name.split(".").pop();
    return ext && ext.length <= 5 ? ext.toLowerCase() : "jpg";
}

export async function uploadListingPhotos(files: File[], userId: string): Promise<string[]> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
        throw new Error("Photo upload isn't configured on this deployment.");
    }
    const urls: string[] = [];
    for (const file of files) {
        const path = `${userId}/${crypto.randomUUID()}.${fileExtension(file.name)}`;
        const { error } = await supabase.storage
            .from(LISTING_PHOTOS_BUCKET)
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type || "image/jpeg",
            });
        if (error) {
            throw new Error(`Couldn't upload ${file.name}: ${error.message}`);
        }
        const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
    }
    return urls;
}
