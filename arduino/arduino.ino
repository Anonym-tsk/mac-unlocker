/* 
 --------------------------------------------------------------
 * Pin layout should be as follows:
 * Signal     Pin              Pin               Pin
 *            Arduino Nano     Arduino Mega      MFRC522 board
 * ------------------------------------------------------------
 * Reset      9                5                 RST
 * SPI SS     10               53                SDA
 * SPI MOSI   11               51                MOSI
 * SPI MISO   12               50                MISO
 * SPI SCK    13               52                SCK
 *
 * The reader can be found on eBay for around 5 dollars. Search for "mf-rc522" on ebay.com. 
 */

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9
#define LED_PIN 13

MFRC522 mfrc522(SS_PIN, RST_PIN);        // Create MFRC522 instance.

void setup() {
        pinMode(LED_PIN, OUTPUT);            // Led pin
        Serial.begin(115200);            // Initialize serial communications with the PC
        SPI.begin();                     // Init SPI bus
        mfrc522.PCD_Init();              // Init MFRC522 card
}

void loop() {
        // Look for new cards
        String cardId = getCardUid();
        if (cardId == "") {
                return;
        }
        Serial.println("Found card " + cardId);
        sendRDIFNumberToSerial(cardId);
}

String getCardUid() {
        // Getting ready for Reading PICCs
        if (!mfrc522.PICC_IsNewCardPresent()) { // If a new PICC placed to RFID reader continue
                return "";
        }
        
        if (!mfrc522.PICC_ReadCardSerial()) { // Since a PICC placed get Serial and continue
                return "";
        }

        String uid = "";
        for (byte i = 0; i < mfrc522.uid.size; i++) {
                uid += mfrc522.uid.uidByte[i] < 0x10 ? "0" : "";
                uid += mfrc522.uid.uidByte[i];
        }

        mfrc522.PICC_HaltA();
        return uid;
}

void sendRDIFNumberToSerial(String cardId) {
        Serial.println("S" + cardId + "E");
}

void serialEvent() {
        String inputString = "";
        while (Serial.available()) {
                char inChar = (char)Serial.read();
                inputString += inChar;

                if (inputString == "M1F") {
                        Serial.flush();
                        Serial.println("Logged in");
                        blinkSuccess();
                }
                else if (inputString == "M0F") {
                        Serial.flush();
                        Serial.println("Not logged in");
                        blinkFailure();
                }
        }
}

void blinkSuccess() {
        digitalWrite(LED_PIN, HIGH);
        delay(2000);
        digitalWrite(LED_PIN, LOW);
}

void blinkFailure() {
        digitalWrite(LED_PIN, HIGH);
        delay(200);
        digitalWrite(LED_PIN, LOW);
        delay(200);
        digitalWrite(LED_PIN, HIGH);
        delay(200);
        digitalWrite(LED_PIN, LOW);
        delay(200);
        digitalWrite(LED_PIN, HIGH);
        delay(200);
        digitalWrite(LED_PIN, LOW);
}
