# Fact Finder - gdrive-bot

<table cellspacing="0" cellpadding="0" border="0" cellborder="0" style="border: 0;">
<tr>
<td style="border: 0;" style="text-align: center;">
  <a href="https://twitter.com/factfinderbot" target="_blank">
    <img src="https://pbs.twimg.com/profile_images/1426894389704491009/Jwd8htLk_400x400.jpg" alt="Fact Finder Bot" style="border-radius: 50%; width: 120px;" width="120">
  </a>
  <div style="font-size: 14px; margin-top: 10px; text-align: center;">
    <a href="https://twitter.com/factfinderbot" target="_blank">@factfinderbot</a>
  </div>
</td>
<td style="border: 0;">
  <blockquote style="font-size: 20px;">
    " <strong> I crave EXIFs 🤖🤖🤖.</strong><br/>
      Feed me the files with EXIF!"
  </blockquote>
</td>
</tr>
</table>

Live (Release): https://factfinder.app \
Preview (Dev): https://fact-finder.vercel.app

## เปรียบเทียบ <a name="compare"></a>


| ช่องทาง | ความสะดวก | โครงสร้างข้อมูล | ความน่าเชื่อถือ | ความเป็นส่วนตัว |
| :---:  | :---:     | :---:        | :---:      | :---: |
| **[Twitter](../twitter-bot)** | **มากกว่า** | ไม่มี | น้อย | น้อยที่สุด
| **[Google Drive](./)** | น้อยกว่า | *มีบางส่วน* | **มาก (EXIF)** | **มากที่สุด**
| **[LINE](../line-bot)** | **มากกว่า** | **มีสมบูรณ์** | น้อย | *มากกว่า*

*- **ความสะดวก (accessibility):** วัดผลจาก ความพร้อมใช้ ความแพร่หลาย และความง่ายต่อการใช้งาน ของช่องทางนั้น ๆ* \
*- **โครงสร้างข้อมูล (structural data input):** หมายถึง ช่องทางนั้น ๆ เปิดให้มีการถาม-ตอบ หรือ บังคับให้ผู้ใช้กรอกข้อมูลแบบมีโครงสร้าง เข้ามาหรือไม่?* \
*- **ความน่าเชื่อถือ (data trustworthiness):** แหล่งข้อมูลที่มีความน่าเชื่อถือมากกว่า คือแหล่งข้อมูลที่ถูกบันทึกโดยอุปกรณ์ที่ใช้ในการบันทึกภาพโดยอัตโนมัติ โดยเปิดโอกาสให้ผู้ใช้สามารถทำการแก้ไขได้โดยง่ายน้อยที่สุด* \
*- **ความเป็นส่วนตัว (privacy):** หมายถึง ผู้ใช้จำเป็นต้องถูกเปิดเผยตัวตนในการรายงานข้อมูลเข้ามาหรือไม่?*

## ความเป็นมา

เพื่อเป็นการคุ้มครองข้อมูลส่วนบุคคล ทำให้ **ผู้ให้บริการส่วนใหญ่ถอดข้อมูล [EXIF](https://en.wikipedia.org/wiki/Exif) และ metadata ออกจากไฟล์ ภาพ และ วิดีโอ**  ที่ถูกส่งผ่าน platform นั้น ๆ [See: [What happens to the Exif data for my photo?](https://help.twitter.com/en/using-twitter/tweeting-gifs-and-pictures)]

ด้วยเหตุนี้ ทำให้ **Fact Finder สูญเสียข้อมูลที่สำคัญ *ที่เชื่อถือได้*** ไม่ว่าจะเป็นข้อมูล วัน-เวลา (timestamp) และ สถานที่ (geotag) ที่ถูกฝังอยู่ใน EXIF data โดยอัตโนมัติจากอุปกรณ์ที่ใช้ทำการบันทึกภาพ

## ทางออก

เพิ่มช่องทางที่ใช้เป็นแหล่งของข้อมูล (data source) ผ่านการอัปโหลดไฟล์อย่าง *Google Drive* (ดู [ตารางเปรียบเทียบ](#compare) ด้านบน)

---

## Specification

A bot should crawl data from [Fact Finder Upload](https://drive.google.com/drive/u/5/folders/10Tqb4HkVjUO6ruyE8qhbrH6pP8JqbGFl) gdrive folder and move processed files to [Fact Finder](https://drive.google.com/drive/u/5/folders/1KSrbCxb023YG6x353as4qcLZ5WlHZja0) processed folder. Then, save crawled data into db to letting web `frontend` to display them.

The bot must extract EXIF data from file if available.

## How to run

### Prerequisites

Do the following steps once you newly clone/checkout the project from the repository.

#### Install firebase-tool

```
npm install -g firebase-tools
```
*See: https://github.com/firebase/firebase-tools*

#### Install dependencies
Go to `gdrive-bot/functions` directory then run:
```
npm install
```

### Run on Local Server

##### Compile typescript sources
Go to `gdrive-bot/functions` directory then run:
```
npm run build
```

##### Run firebase emulator
Go to `gdrive-bot` directory then run:
```
firebase emulators:start
```

##### Call your API

Your cloud functions will be up & running on:
`https://localhost:5001/fact-finder-app/$REGION/$FUNCTION_NAME`

*See: https://firebase.google.com/docs/functions/local-emulator*
