const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.get("/api/scrape", async (req, res) => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    
    await page.goto("https://pddikti.kemdiktisaintek.go.id/detail-pt/zg_3icnMAaPL1deiDeyfCBFGe1UuKmRv6Gcc94w5VGsMQqQXzV6K8fppmw7TRqsWgBLB6g==", { waitUntil: "networkidle2" });

    // Pilih dropdown pagination dan set ke "semua"
    await page.select("select[name='pagination']", "semua");
    await new Promise(resolve => setTimeout(resolve, 5000));
 // Tunggu agar halaman reload

    // Scrape tabel setelah pagination diperbarui
    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll("tbody tr");
        return Array.from(rows).map((row, index) => {
            const columns = row.querySelectorAll("td");
            if (columns.length >= 10) {
                return {
                    no: index + 1,
                    nama_prodi: columns[1].innerText.trim(),
                    jumlah_mahasiswa: columns[9].innerText.trim(),
                };
            }
        }).filter(Boolean);
    });

    await browser.close();
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
