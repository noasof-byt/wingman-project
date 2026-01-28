const signupbutton = document.getElementById("goTosignup");//כל הבדיקות והולידציות קורות בשרת ולפני כן בהרשמה עצמה לכן הוספת ולידציות נוספות כאן תהווה כפילות מיותרת
signupbutton.addEventListener("click", () => {//בלחיצה על הכפתור נעביר את המשתמש לדף הרשמה
   window.location.href = "../html/SignUp.HTML";
});
