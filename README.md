# App Inventor 群島

十一座虛擬島嶼，依資訊課的學習順序學會用 MIT App Inventor 做手機 App：設計師與元件、事件、屬性、文字、數學、變數（含 TinyDB）、判斷、清單與迴圈、動畫（Clock／Canvas／ImageSprite）、感測器與多媒體、程序。

- 3D 群島地圖（Three.js），直升機從停機坪來接送，到目的島上空跳傘降落
- 每座島：觀念、積木（App Inventor 配色與中文積木文字）、範例程式、Python／JavaScript 對照、常見錯誤、島長任務
- **動手做（模擬 App Inventor 操作台）**：每個區域一個練習，用和 App Inventor 同一套 Blockly 積木拖拉組合，右邊的模擬手機會即時執行（按鈕、計時器、畫布精靈、TinyDB、搖一搖、語音都能動），「檢查任務」自動判斷有沒有做對；設計島則是在模擬設計師裡排畫面
- **下載 .aia**：每個練習都能下載完成版範例或自己的作品，到 ai2.appinventor.mit.edu「專案 › 匯入專案 (.aia)」就能在真的 App Inventor 打開、用 AI2 Companion 裝到手機
- 每座島有進度百分比，未完成離島會跳出警示
- RPG：建立角色（四種職業）、等級與經驗值、金幣、體力、島長對話、島嶼徽章、背包與商店
- 日夜變化：島嶼的天色、海色、光線依真實時間變化，可一鍵快轉一天
- 進度與角色存在瀏覽器的 localStorage

純靜態網頁：`index.html`（島嶼與教學）、`lab-core.js`（元件規格、練習題、積木直譯器、.aia 匯出）、`lab-ui.js`（積木編輯器與模擬手機）。積木編輯器用 Blockly 11（unpkg 載入），.aia 打包用 JSZip（cdnjs 載入）。和「Scratch 積木群島」「GGB 數學島」同一個系列。
