# FactFinder.app

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
    " Only Facts We Trust, No Prejudice! "
  </blockquote>
</td>
</tr>
</table>

Live (Release): https://factfinder.app \
Preview (Dev): https://fact-finder.vercel.app

## ความเป็นมา

- จากสถานการณ์ทางการเมืองในปัจจุบัน ที่เกิดการชุมนุมในรูปแบบต่าง ๆ ทั้งจากต่างสถานที่ และต่างเวลา ทำให้ยากต่อการรวบรวมข้อมูลข้อเท็จจริง ที่ในหลาย ๆ ครั้งได้เกิดเหตุปะทะ มีการใช้กำลังเกินกว่าเหตุ ไม่เป็นไปตามหลักสากล และเป็นสิ่งที่ไม่พึงปรารถนาสำหรับทุกฝ่าย

- ***Fact Finder*** เป็นเครื่องมือที่ทำขึ้นจากอาสาสมัคร เพื่อใช้ในการรวบรวมข้อมูล **ภาพ วิดีโอ และวัตถุพยาน** มาลำดับเป็นเหตุการณ์ให้เห็นพัฒนาการของสถานการณ์การชุมนุม  **ผ่านการแสดงผลข้อมูลบนแผนที่ตามแกนเวลา**  เพื่อให้ผู้ใช้สามารถสืบค้นข้อมูลได้โดยง่ายว่า **ใคร (who) ทำอะไร (what) ที่ไหน (where) เมื่อไหร่ (when) อย่างไร (how)** เพื่อใช้ประกอบการ **สืบหา "ข้อเท็จจริง" (facts finding)** ในสถานการณ์การชุมนุมต่าง ๆ เหล่านั้น

## วัตถุประสงค์

- เพื่อใช้เป็นเครื่องมือในการเก็บบันทึกข้อมูล สถานที่ วัตถุพยาน ลำดับเหตุการณ์ ในสถานการณ์การชุมนุม และการใช้ความรุนแรงต่าง ๆ

- เพื่อเผยแพร่ข้อมูลข้อเท็จจริง (facts) เชิงวัตถุวิสัย (objective) ให้กับทุกฝ่าย ผ่านหน้าจอการใช้งาน (UI) ที่ผู้ใช้สามารถสืบค้นข้อมูลได้โดยง่าย

## Fact Finder ≠ Fact Checker

- วัตถุประสงค์ของแพลตฟอร์มนี้ <u>ไม่ใช่</u>การตรวจสอบข้อเท็จจริง (facts checking) แต่เป็นการให้บริการเครื่องมือสำหรับการสืบค้นข้อมูลข้อเท็จจริง (facts finding) เป็นหลัก

- บรรดารายงานการสรุปผลการตรวจสอบข้อเท็จจริง รายงานการใช้ความรุนแรงในสถานการณ์การชุมนุม หรือบรรดารายงานต่าง ๆ ที่อาจมีการให้ความเห็นเชิงอัตวิสัย (subjective) <u>ไม่ได้</u>อยู่ในขอบเขตของ *Fact Finder*


## Fact Finder ทำงานอย่างไร?

![](./docs/images/feed_system.png)
![](./docs/images/display_system.png)
[ดู Figma Mock UI เต็มๆ ได้ที่นี่](https://t.co/ADv9D8vgmq?amp=1)

## Technology Stack

- *Frontend*: Nuxt.js
- *Backend*: (M1) Google Cloud Function, Firebase

## Milestones

### Milestone 1
- **Deadline:** TBD
- PoC with **Twitter Bot** Feeder

### Milestone 2
- **Deadline:** TBD
- Migrate to proper architecture (if necessary)
- **LINE Chat Bot** Feeder
- **Google Drive Bot** Feeder

## How to contribute ❤️

ทุกคนที่ช่วยงานนี้ล้วนเป็นทีมอาสา เราใช้ GitHub ในการจัดการ และแบ่งงานส่วนต่าง ๆ

คุณสามารถเริ่มเป็นทีมอาสาสมัครได้ง่าย ๆ โดยการเข้าหน้า [Issue](https://github.com/kaogeek/fact-finder/issues) แล้วก็... *เริ่มลุยได้เลย!* 💪

คุณสามารถดู API Contract และ documentation อื่น ๆ [ได้ที่นี่](./docs)
