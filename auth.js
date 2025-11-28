// auth.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// يجب استيراد المتغيرات والدوال العالمية التي يحتاجها هذا الملف من index.html
// يتم تمريرها كمعاملات (parameters) عند استدعاء هذه الدالة
export const startAppAuthentication = (auth, db, setupUI, setupRealtimeListener) => {
    
    // إظهار حالة التحميل
    document.getElementById('loading-state').style.display = 'flex';
    
    // متغيرات مساعدة لحفظ حالة المستخدم
    let userId = null;
    let userRole = null; 

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // **الخطوة 1: المستخدم مسجل الدخول، الآن نتحقق من دوره**
            const uid = user.uid;
            const userRolesRef = doc(db, 'user_roles', uid);
            
            getDoc(userRolesRef)
                .then((docSnapshot) => {
                    userRole = docSnapshot.exists() ? docSnapshot.data().role : null;
                    
                    document.getElementById('loading-state').style.display = 'none';

                    // 💥 منطق التحكم في الوصول:
                    if (userRole === 'admin') {
                        // مسؤول (Admin): سماح بالوصول الكامل
                        userId = uid;
                        // 💡 جعل المتغيرات والدوال الأساسية متاحة عالمياً
                        window.userId = userId;
                        window.userRole = userRole; 
                        
                        setupUI('admin');
                        setupRealtimeListener(userId); // تمرير userId إلى دالة الاستماع
                        
                    } else if (userRole === 'employee') {
                         // موظف (Employee): توجيهه إلى صفحة الموظف
                        window.location.href = 'employee_dashboard.html';
                        
                    } else {
                        // دور غير مصرح به أو غير محدد
                        alert("غير مصرح لك بالوصول إلى لوحة التحكم.");
                        signOut(auth).then(() => {
                            window.location.href = 'login.html';
                        });
                    }
                })
                .catch(error => {
                    document.getElementById('loading-state').style.display = 'none';
                    console.error("Error checking role:", error);
                    signOut(auth).then(() => {
                        window.location.href = 'login.html';
                    });
                });

        } else {
            // **الخطوة 2: المستخدم غير مسجل الدخول، توجيهه إلى صفحة تسجيل الدخول**
            window.location.href = 'login.html';
        }
    });
};

// 💡 تصدير دالة تسجيل الخروج أيضاً لاستخدامها في الأزرار
export const signOutUser = (auth) => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    }).catch(e => console.error("Sign Out Error:", e));
};