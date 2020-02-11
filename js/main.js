// ユーザー登録数を保持する変数
var postNumber;

// ユーザー情報を保持する変数
var currentUser;

// 画面を変更する
function showView(id) {
  $(".view").hide();
  $("#" + id).fadeIn();

  if (id === "top") {
    loadTopView();
  }
}

//textBoxの初期化
function resetTextBox(id) {
  $("#" + id).val("");
}

// 投稿フォームの初期化
function resetPostForm() {
  resetTextBox("name");
  resetTextBox("age");
  resetTextBox("from");
  $("input[name=sex]:checked").prop("checked", false);
}

// ログインフォームの初期化
function resetLoginForm() {
  resetTextBox("email");
  resetTextBox("password");
}

// ログインした直後に呼ばれる
function onLogin() {
  console.log("ログイン完了");
  showView("top");
}

// ログアウトしたときに呼ばれる
function onLogout() {
  console.log("ログアウト完了");
  showView("login_page");
}

//未入力のエラー処理
function errorCheck() {
  var flag = 0;
  var errorText = "";
  if ($("#name").val() == "") {
    flag++;
    errorText += "名前 ";
  }
  if ($("input[name='sex']:checked").val() == null) {
    flag++;
    errorText += "性別 ";
  }
  if ($("#age").val() == "") {
    flag++;
    errorText += "年齢 ";
  }
  if ($("#from").val() == "") {
    flag++;
    errorText += "出身地 ";
  }
  if (flag > 0) {
    errorText += "を入力してください。";
    $("#errorOut").text(errorText);
    return -1;
  }
  return 0;
}

// TOP画面の初期化
function loadTopView() {
  peoplesRef = firebase
    .database()
    .ref("peoples")
    .orderByChild("createdAt");

  peoplesRef.off("child_added");

  peoplesRef.on("child_added", function(people) {
    var peopleId = people.key;
    var peopleData = people.val();
    addPeopleData(peopleId, peopleData);
  });
}

function addPeopleData(peopleId, peopleData) {
  var $divTag = createPeopleDiv(peopleId, peopleData);
  $divTag.appendTo("#post-content > div > div");

  // $postContentNumber.text("1");
  // $postContent.appendTo(".post-location");
}

function createPeopleDiv(peopleId, peopleData) {
  var $divTag = $("#post-content-template > .row").clone();

  $divTag.find(".post-content-number").text(peopleData.number);
  $divTag.find(".post-content-name").text(peopleData.name);
  $divTag.find(".post-content-age").text(peopleData.age);
  $divTag.find(".post-content-sex").text(peopleData.sex);
  $divTag.find(".post-content-from").text(peopleData.from);
  // console.log($divTag);
  return $divTag;
}

$(document).ready(function() {
  // var flag = true;
  // $(".btn").click(function() {
  //   if (!flag == true) {
  //     $(".heading").fadeIn();
  //     flag = true;
  //   } else {
  //     $(".heading").fadeOut();
  //     flag = false;
  //   }
  // });
  // firebase.auth();

  // 新規ユーザー登録機能
  // firebase.auth().creatUserWithEmailAndPassword(email,password);

  // 既存ユーザーのログイン
  // firebase.auth().signInWithEmailAndPassword(email,password);

  // ログイン状態の監視
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user);
      // $(".success-message").show();
      $(".current-email").text(user.email);
      onLogin();
      resetLoginForm();
    } else {
      onLogout();
    }
  });

  $("#loginBtn").click(function() {
    var email = $("#email").val();
    var password = $("#password").val();

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(function(error) {
        console.log("ログイン失敗");
      });
  });

  $("#newuserBtn").click(function() {
    $(".errorLogin").text("");
    $("#password").css("border","");
    var email = $("#email").val();
    var password = $("#password").val();

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(function(user) {
        console.log("新しいユーザーを登録します。");
        console.log(user);
      })
      .catch(function(error) {
        console.log("ユーザー登録に失敗しました。");
        console.log(error);
        if(error.code == "auth/weak-password"){
          $("#password").css("border", "1px solid red");
          $(".errorLogin").text("パスワードが短すぎます。6文字以上で設定してください。");
        }
      });
  });

  $(".logout-btn").click(function() {
    firebase
      .auth()
      .signOut()
      .then(function() {
        console.log("ログアウトします");
      })
      .catch(function(error) {
        console.log("ログアウトできません。");
        console.log("エラーコード:" + error.code);
      });
  });

  //グーグルアカウントでログイン
  $("#googleLoginBtn").click(function() {
    return false;
  });

  // 投稿ボタンをクリックした時の処理
  $(".post-btn").click(function() {
    $("#errorOut").text("");
    if (errorCheck() == -1) {
      return false;
    }
    var name = $("#name").val();
    var sex;
    if ($("input[name=sex]:checked").val() == 1) sex = "男";
    else sex = "女";

    var age = $("#age").val();
    var from = $("#from").val();
    var peoplesRef = firebase.database().ref("peoples");
    peoplesRef.once("value", function(data) {
      console.log(data.numChildren());
      postNumber = data.numChildren() + 1;
    });

    //↑をfirebaseのデータベースに登録する
    var peopleData = {
      number: postNumber,
      name: name,
      sex: sex,
      age: age,
      from: from,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    firebase
      .database()
      .ref("peoples")
      .push(peopleData)
      .then(function() {
        console.log("登録されました。");
        alert("データベースに登録されました。");
        resetPostForm();
      })
      .catch(function(error) {
        console.log("ユーザー情報の登録に失敗しました");
        console.log(error);
      });

    // firebase
    //   .database()
    //   .ref("numberOfPoeples")
    //   .push(number);

    // alert(name + age + sex + from);
  });

  return false;
});
