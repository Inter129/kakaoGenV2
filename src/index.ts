import axios from "axios";
import playwright from "playwright";
import fs from "fs";
import { execFileSync } from "child_process";

const config = {
  password: "@TestPassword123",
  expresso: false, // If you want to use expresso then make sure to move the expresso.exe to the root of the project
};

const gen = async () => {
  let browser = await playwright.firefox.launch({
    headless: false,
    // no bypass <3
  });
  try {
    let context = await browser.newContext({
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    });
    let page = await context.newPage();
    let mdata = await axios.get(
      "http://internxt.com/api/temp-mail/create-email"
    ); // Is internxt.com down?
    let email = mdata.data.address;
    let mailToken = mdata.data.token;
    let cframe: playwright.FrameLocator | null = null;
    await page.goto(
      "https://accounts.kakao.com/weblogin/create_account/?lang=en&continue=https%3A%2F%2Fmail.kakao.com#selectVerifyMethod"
    );

    const router = async (r: playwright.Route) => {
      if (
        r.request().url().includes("googleads") ||
        r.request().url().includes("tiara")
      )
        r.abort();
      else r.continue();
    };
    await page.route("**", router);
    const resLis = async (res: playwright.Response) => {
      try {
        if (res.url().includes("/v2/signup/send_passcode_for_create.json")) {
          let d = await res.json();
          if (d.status == -482 || d.status == -481) {
            try {
              await cframe?.locator("#btn_dkaptcha_reset").click({
                timeout: 1000 * 10,
              });
            } catch (e) {
              if (config.expresso)
                execFileSync("expresso.exe", [
                  "connect",
                  "-c",
                  "--random",
                  "Japan",
                ]);
              console.error("Cannot find captcha (ip ban?)");
              return browser.close();
            }
          }
        }
        if (!res.url().includes("https://dkaptcha.kakao.com/dkaptcha/quiz/"))
          return;
        let data = await res.text();
        if (!data.includes("the following icon"))
          fs.writeFileSync(
            `./data/${
              Date.now().toString() + Math.random().toString(32).substr(5)
            }.html`,
            data
          );

        let img = data.split(`class="img_map" src="`)[1].split(`"`)[0];
        if (data.includes("the following icon"))
          await cframe?.locator("#btn_dkaptcha_reset").click();
        else if (data.includes("the full name")) {
          let d = data
            .split(`of <em class="emph_txt2">`)[1]
            .split("</em> shown on the map")[0];
          if (d == "Pharm") d = "Pharmacy";
          if (d == "Bank") d = "IBK Bank";
          console.log(d);
          await cframe?.locator("#inpDkaptcha").fill(d);
          await cframe?.locator("#inner_submit_btn").click();
        } else if (data.includes("following place and fill in")) {
          let ans = "";
          data = data.replace(`<span class="blank_txt">Blank</span>`, "");
          data = data.replace(`<span class="blank_txt"></span>`, "_");
          let sam = data
            .split(`Question</strong>`)[1]
            .split(`</p>`)[0]
            .replaceAll(" ", "")
            .replaceAll("<p>", "")
            .replaceAll("</p>", "")
            .replaceAll("<span>", "")
            .replaceAll("</span>", "");
          if (sam == "_S25") ans = "G";
          if (sam == "_tarbucks") ans = "S";
          if (sam == "IBK_nk") ans = "Ba";
          if (sam == "G_25") ans = "S";
          if (sam == "IBKB_k") ans = "an";
          if (sam == "GS2") ans = "5";
          if (sam == "Starbuc_s") ans = "k";
          if (sam == "KBB_nk") ans = "a";
          if (sam == "C_fe") ans = "o";
          if (sam == "_afe") ans = "C";
          if (sam == "Ca_e") ans = "f";
          if (sam == "Coffe_") ans = "e";
          if (sam == "S_venEleven") ans = "e";
          if (sam == "Lot_eMart") ans = "t";
          if (sam == "Dayc_re") ans = "a";
          if (sam == "Dayca_e") ans = "r";
          if (sam == "IB_ank") ans = "K";
          console.log(sam, ans);

          if (ans != "") {
            await cframe?.locator("#inpDkaptcha").fill(ans);
            await cframe?.locator("#inner_submit_btn").click();
          } else {
            fs.appendFileSync("kcaptcha.txt", sam + ":" + img + "\n");
            await cframe?.locator("#btn_dkaptcha_reset").click();
          }
        } else {
          console.log("New captcha type?");
          await cframe?.locator("#btn_dkaptcha_reset").click();
        }
      } catch (e) {}
    };
    page.on("response", resLis);
    await page.click(".submit");
    await page.waitForSelector("#check_all--1");
    await page.evaluate(`document.querySelector("#check_all--1").click()`);
    await page.click(".submit");
    console.log(email, mailToken);
    await page.fill(`input[type="email"]`, email);
    await page.click(".btn_round");
    cframe = page.frameLocator("iframe");
    page.waitForLoadState("domcontentloaded");

    let eCode = "";
    while (eCode == "") {
      await new Promise((r) => setTimeout(r, 200));
      let dmx = await axios.get(
        "https://internxt.com/api/temp-mail/get-inbox?token=" + mailToken
      );
      if (dmx.data.emails.length > 0) {
        eCode = dmx.data.emails[0].html
          .split(`font-size:14px;font-weight:bold;word-break:break-all" >`)[1]
          .split("</td>")[0];
      }
    }
    await page.fill("#email_passcode--10", eCode);
    console.log(eCode);
    await page.click(".submit");
    await page.fill(`input[name="new_password"]`, config.password);
    await page.fill(`input[name="password_confirm"]`, config.password);
    await page.click(".submit");
    await page.fill(`input[name="profile_nickname"]`, email.split("@")[0]);
    await page.click(".select_year > div > div > button");
    await page.click(
      ".select_open > ul:nth-child(4) > li:nth-child(12) > button:nth-child(1)"
    );
    await page.click(".select_tf:nth-child(2) > div > div > button");
    await page
      .getByRole("button", {
        name: "12",
      })
      .click();
    await page.click(".select_tf:nth-child(3) > div > div > button");
    await page
      .getByRole("button", {
        name: "12",
      })
      .click();
    await page.click(".submit");
    await page.getByText("Get Started").click();
    await page.waitForSelector("#acceptButton");
    await page.waitForLoadState("networkidle");
    await page.evaluate(`document.querySelector("#agreeAll").click()`);
    await page.click("#acceptButton");
    await page.waitForLoadState("networkidle");
    // TODO: kakao mail register
  } catch (e) {
    try {
      //browser.close();
    } catch (e) {}
  }
};

gen();
