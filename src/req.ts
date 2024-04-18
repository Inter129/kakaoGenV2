import axios from "axios";

const config = {
  iframeUrl:
    "https://dkaptcha.kakao.com/dkaptcha/quiz?widget={{widgetId}}&platform=pc&language=en&theme=white&option=iframe&url=https%3A%2F%2Faccounts.kakao.com%2Fweblogin%2Fcreate_account%2F%3Flang%3Den%23requestVerifyEmail&userInfo=%7B%22ua%22%3A%22mozilla%2F5.0%20(windows%20nt%2010.0%3B%20win64%3B%20x64%3B%20rv%3A124.0)%20gecko%2F20100101%20firefox%2F124.0%22%2C%22timeOpened%22%3A%222024-04-12T13%3A00%3A53.661Z%22%2C%22timezone%22%3A-9%2C%22sizeScreenW%22%3A1127%2C%22sizeScreenH%22%3A955%2C%22referrer%22%3A%22%22%2C%22sessionLength%22%3A5%2C%22browserLanguage%22%3A%22en-US%22%2C%22browserOnline%22%3Atrue%2C%22dataCookiesEnabled%22%3Atrue%2C%22dataCookies%22%3A%22__T_%3D1%3B%20_kalang%3Den%22%2C%22os%22%3A%22os_android%22%2C%22browser%22%3A%22firefox%22%2C%22platform%22%3A%22pc%22%2C%22version%22%3A%22version_124_0%22%7D",
  password: "@Macbook",
};

//{"url":"https://accounts.kakao.com/weblogin/create_account/?lang=en#requestVerifyEmail","platform":"pc","language":"en","theme":"white","option":"iframe","quizType":"3","fail":true}

const gen = async () => {
  let kxios = axios.create({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
      //   Referer: "https://accounts.kakao.com/weblogin/create_account/?lang=en",
      //   Origin: "https://accounts.kakao.com",
    },
    validateStatus: () => true,
  });
  let mdata = await axios.get(
    "https://internxt.com/api/temp-mail/create-email"
  );
  let email: string = mdata.data.address;
  let mailToken: string = mdata.data.token;

  let genPage = await kxios.get(
    "https://accounts.kakao.com/weblogin/create_account/?lang=en"
  );
  let cookieStr = "";
  genPage.headers["set-cookie"]!.forEach((cookie: string) => {
    cookieStr += cookie.split(";")[0] + "; ";
  });
  cookieStr = "_kalang=en; " + cookieStr;
  let csrf = genPage.data.split(`{"_csrf":"`)[1].split(`"`)[0];
  console.log(cookieStr, csrf);
  let td = await kxios.post(
    "https://accounts.kakao.com/v2/signup/send_passcode_for_create.json",
    `_csrf=${csrf}&appType=web&created_from=web&email=${email.replace(
      "@",
      "%40"
    )}&serviceName=web`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Cookie: cookieStr,
      },
    }
  );
  console.log(td.data);
  let cap = await kxios.get(
    config.iframeUrl.replace("{{widgetId}}", td.data.dkaptcha.widgetId)
  );
  if (cap.headers["set-cookie"]) {
    cookieStr += cap.headers["set-cookie"][0].split(" ")[0];
  }
  console.log(cap.data);
  let capToken = cap.data.split(`data-token="`)[1].split(`"`)[0];
  console.log(capToken);
  cap = await kxios.post(
    "https://dkaptcha.kakao.com/dkaptcha/quiz/Hnk2HU9KSA",
    {
      url: "https://accounts.kakao.com/weblogin/create_account/?lang=en#requestVerifyEmail",
      platform: "pc",
      language: "en",
      theme: "white",
      option: "iframe",
      quizType: "3",
      fail: false,
    },
    {
      headers: { Cookie: cookieStr },
    }
  );
  console.log(cap.data);

  if (!cap.data.includes("the full name")) console.log("no data");
  else {
    let d = cap.data
      .split(`of <em class="emph_txt2">`)[1]
      .split("</em> shown on the map")[0];
    console.log(d);
  }
};

gen();
