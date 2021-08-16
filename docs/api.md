## GET /events

- **Description:** List รายชื่อเหตุการณ์ เพื่อใช้แสดงในตัวเลือก
![image](https://user-images.githubusercontent.com/2979072/129572662-f915a203-c6f3-4ad3-8053-7a7f7feb888e.png)

### Parameters
- **beginDate** *(Optional) :* Filter เฉพาะเหตุการณ์ที่เริ่มตั้งแต่เวลา
- **endDate** *(Optional) :* Filter เฉพาะเหตุการณ์ที่จบไม่เกินเวลา

### Response
```json
    {
    	"events": [
            {
                "id": 1,
                "name": "กลุ่มทะลุฟ้า 15 สิงหาคม",
                "beginDate": "2021-08-17T03:00:00Z",
                "endDate": "2021-08-17T05:00:00Z"
            },
            {
                "id": 2,
                "name": "คาร์ม๊อบ 16 สิงหาคม",
                "beginDate": "2021-08-17T03:00:00Z",
                "endDate": ""
            }
    	]
    }
```

## GET /records

- **Description:** List รูปภาพ และคลิป ของเหตุการณ์ ในช่วงเวลาที่กำหนด
![image](https://user-images.githubusercontent.com/2979072/129572696-335a4b35-5341-4451-80f9-4229dc0c6fdd.png)


### Parameters
- **eventId** : เหตุการณ์ที่ต้องการ records
- **beginDate** *:* Filter เฉพาะเหตุการณ์ที่เริ่มตั้งแต่เวลา
- **endDate** *:* Filter เฉพาะเหตุการณ์ที่จบไม่เกินเวลา
- **filterTags** *(Optional)* : Filter tag ประกอบข้อมูล เช่น ใช้ความรุนแรง การกระทำของผู้ชุมนุม

### Response
```json
    {
        "records": [
            {
                "id": "ffbb9836-e788-4ab8-8ecc-f85a88b8f64e",
                "timestamp": "2021-08-17T03:00:00Z",
                "mediaUrl": "https://picsum.photos/200/300",
                "mediaType": "STILL",
                "referenceUrl": "https://twitter.com/MatichonOnline/status/1427240965962559494?s=20",
                "referenceType": "TWITTER",
                "tags": ["violence", "capture"],
                "reporter": "User1234",
                "weight": "5"
            },
            {
                "id": "ffbb9836-e788-4ab8-8ecc-f85a88b8f64e",
                "timestamp": "2021-08-17T03:00:00Z",
                "mediaUrl": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "mediaType": "VIDEO",
                "referenceUrl": "",
                "referenceType": "PRIVATE_REPORT",
                "tags": ["violence"],
                "reporter": "User1234",
                "weight": "3"
            }
        ]
    }
```
