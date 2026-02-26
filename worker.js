export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file"); // file dari front-end
        if (!file) throw new Error("No file uploaded");

        // Tentukan folder berdasarkan tipe file
        const folder = file.type.startsWith("image/") ? "covers/" : "audio/";
        const fileName = `${folder}${Date.now()}-${file.name}`;

        // Upload ke R2
        await env.dynotic_storage.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        // URL file
        const fileURL = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;

        return new Response(JSON.stringify({ success: true, url: fileURL }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });

      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  },
};
