        function switchLoginTab(n) {
            [1,2,3].forEach(function(i) {
                var panel = document.getElementById('loginPanel' + i);
                var tab   = document.getElementById('loginTab'   + i);
                if (panel) panel.style.display = (i === n) ? '' : 'none';
                if (tab)   tab.classList.toggle('active', i === n);
            });
        }

        function startFaceScan(mode) {
            var idle     = document.getElementById('faceIdle');
            var scanning = document.getElementById('faceScanning');
            var success  = document.getElementById('faceSuccess');
            var error    = document.getElementById('faceError');
            var btn      = document.getElementById('faceScanBtn');
            var nameEl   = document.getElementById('faceStaffName');

            if (idle)     idle.style.display     = 'none';
            if (scanning) scanning.style.display = '';
            if (success)  success.style.display  = 'none';
            if (error)    error.style.display     = 'none';
            if (nameEl)   nameEl.style.display    = 'none';
            if (btn)      btn.disabled = true;

            setTimeout(function() {
                if (scanning) scanning.style.display = 'none';
                if (btn) btn.disabled = false;

                if (mode === 'fail') {
                    if (error) error.style.display = '';
                    setTimeout(function(){ if(error) error.style.display='none'; if(idle) idle.style.display=''; }, 2500);
                } else {
                    if (success) success.style.display = '';
                    if (nameEl) { nameEl.textContent = 'นส.สมใจ ดีมาก · กำลังเข้าสู่ระบบ...'; nameEl.style.display = ''; }
                    setTimeout(function() { nav('pg-role'); }, 1000);
                }
            }, 1500);
        }
    

    function alFilter(type, btn) {
        document.querySelectorAll('#alFilterTabs button').forEach(b => {
            b.style.background = 'white'; b.style.color = '#64748b'; b.style.borderColor = '#e2e8f0';
        });
        btn.style.background = '#059669'; btn.style.color = 'white'; btn.style.borderColor = '#059669';
        document.querySelectorAll('.al-row').forEach(row => {
            if (type === 'all' || row.dataset.status === type) row.style.display = '';
            else row.style.display = 'none';
        });
    }
    // Clock for this page
    (function tickAL() {
        const now = new Date();
        const t = document.getElementById('clockAL');
        const d = document.getElementById('dateStrAL');
        if (t) t.textContent = now.toLocaleTimeString('th-TH');
        if (d) d.textContent = now.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'2-digit'});
        setTimeout(tickAL, 1000);
    })();
    

    function tick() {
        const now  = new Date();
        const time = now.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
        const date = now.toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
        document.querySelectorAll('[id^="clock"]').forEach(e => e.textContent = time);
        document.querySelectorAll('[id^="dateStr"]').forEach(e => e.textContent = date);
        const ghC = document.getElementById('ghClock');
        const ghD = document.getElementById('ghDate');
        if (ghC) ghC.textContent = time;
        if (ghD) ghD.textContent = date;
    }
    tick();
    setInterval(tick, 1000);

    /* ── Generic navigation ── */
    const pageNames = {
        'pg-cart-list':'รถเข็นยาทั้งหมด','pg-cart':'ข้อมูลรถเข็นยา','pg-confirm':'ยืนยัน Ward','pg-ward-select':'เลือก Ward',
        'pg-login':'เข้าสู่ระบบ','pg-role':'เลือกสิทธิ์','pg-dashboard':'Dashboard',
        'pg-order-plan':'Order Plan','pg-nurse-schedule':'Nurse Schedule','pg-emar':'eMAR',
        'pg-prep-type':'เลือกประเภทจัดยา','pg-hw':'เลือก Drawer','pg-fill':'จัดยาเข้าช่อง',
        'pg-summary':'สรุปผลจัดยา','pg-dispense':'รายการผู้ป่วย','pg-pt-detail':'รายละเอียดผู้ป่วย',
        'pg-scan-pt':'สแกนผู้ป่วย','pg-admin-med':'สแกนยา','pg-witness':'พยาน/IDC',
        'pg-omit':'งดให้ยา','pg-record':'บันทึกผล','pg-success':'สำเร็จ','pg-hardstop':'Hard Stop',
        'pg-routine':'จ่ายยาปกติ','pg-stat':'จ่ายยา STAT','pg-prn':'จ่ายยา PRN',
        'pg-highalert':'จ่ายยา High Alert','pg-omit-flow':'งดให้ยา','pg-overdue':'ยาเลยเวลา',
        'pg-prep-patient':'จัดยาตามผู้ป่วย','pg-prep-pt-drugs':'รายการยาผู้ป่วย',
        'pg-prep-fill-pt':'จัดยาลงช่อง','pg-prep-med':'จัดยาตามรายการยา',
        'pg-prep-med-detail':'รายละเอียดยา','pg-ibf':'จัดยาตามข้อมูลคนไข้',
        'pg-prep-sched':'จัดยาตามเวลา','pg-sched-detail':'รายการรอบเวลา','pg-trf':'จัดยาตามรอบ',
        'pg-post-assess':'ประเมินหลังให้ยา',
        'pg-assess-list':'รายการประเมินหลังให้ยา'
    };

    // Pages that require nurse/head-nurse permission.
    const assessmentPages = ['pg-post-assess','pg-assess-list'];
    const dispensePages = ['pg-routine','pg-stat','pg-prn','pg-highalert','pg-omit-flow','pg-overdue','pg-scan-pt','pg-admin-med','pg-witness','pg-omit','pg-record','pg-hardstop','pg-dispense','pg-pt-detail'];
    // Note: pg-order-plan, pg-nurse-schedule, pg-emar removed — all roles need access
    const landingPages = ['pg-cart-list','pg-cart','pg-confirm','pg-ward-select','pg-login','pg-role'];
    const prepHardwarePages = ['pg-prep-pt-drugs','pg-prep-med-detail','pg-sched-detail'];
    let prepHardwareReady = false;
    let currentRole = 'nurse';
    let appCurrentPage = null;
    const appNavStack = [];

    function canAccessAssessment() {
        return currentRole !== 'pharma';
    }

    function showAssessmentAccessDenied() {
        showToast('เภสัชกรไม่มีสิทธิ์ทำรายการประเมินหลังให้ยา');
        setTimeout(() => showToast(''), 2500);
    }

    function updateGlobalHeaderActions(targetId) {
        const isLandingPage = landingPages.includes(targetId);
        const isLoggedIn = document.body.classList.contains('logged-in');
        const navActions = document.getElementById('ghNavActions');
        if (navActions) navActions.style.display = isLandingPage ? 'none' : 'flex';
        const backendBtn = document.getElementById('ghBackendBtn');
        if (backendBtn) backendBtn.style.display = (isLoggedIn && !isLandingPage && currentRole === 'super') ? 'flex' : 'none';
        const logoutBtn = document.getElementById('ghLogoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = (isLoggedIn && !isLandingPage) ? 'flex' : 'none';
        }
    }

    function getActivePageId() {
        const active = document.querySelector('.page.active');
        return active ? active.id : appCurrentPage;
    }

    function rememberBackTarget(pageId) {
        if (!pageId || !document.getElementById(pageId)) return;
        if (appNavStack[appNavStack.length - 1] !== pageId) appNavStack.push(pageId);
        if (appNavStack.length > 80) appNavStack.splice(0, appNavStack.length - 80);
    }

    function nav(targetId, skipHistory, options) {
        options = options || {};
        if (!canAccessAssessment() && assessmentPages.includes(targetId)) {
            showAssessmentAccessDenied();
            return false;
        }
        // Block pharma from accessing dispense pages
        if (currentRole === 'pharma' && dispensePages.includes(targetId)) {
            showToast('เภสัชกรไม่มีสิทธิ์เข้าถึงหน้าจ่ายยา');
            setTimeout(() => showToast(''), 2500);
            return false;
        }
        const fromPage = getActivePageId();
        const isSamePage = fromPage === targetId;
        if (!skipHistory && !options.fromBack && !options.replaceCurrent && fromPage && !isSamePage) {
            rememberBackTarget(fromPage);
        } else if (!skipHistory && options.replaceCurrent) {
            const existingIdx = appNavStack.lastIndexOf(targetId);
            if (existingIdx >= 0) appNavStack.splice(existingIdx);
        }
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        appCurrentPage = targetId;
        window.scrollTo(0, 0);
        if (!skipHistory) {
            const state = { page: targetId };
            if (options.replaceHistory || options.replaceCurrent || options.fromBack || isSamePage) {
                history.replaceState(state, '', '#' + targetId);
            } else {
                history.pushState(state, '', '#' + targetId);
            }
        }
        // Reset nurse approved-only mode when leaving prep pages
        if (typeof nurseApprovedOnlyMode !== 'undefined' && nurseApprovedOnlyMode) {
            var prepPages = ['pg-nurse-prep','pg-prep-type','pg-prep-patient','pg-prep-pt-drugs','pg-prep-med','pg-prep-med-detail','pg-prep-sched','pg-sched-detail','pg-hw','pg-fill','pg-summary','pg-ibf','pg-trf','pg-prn-hw','pg-prn-fill','pg-prn-summary'];
            if (prepPages.indexOf(targetId) < 0) nurseApprovedOnlyMode = false;
        }

        // Update global header page name
        const ghName = document.getElementById('ghPageName');
        if (ghName) ghName.textContent = pageNames[targetId] || '';
        updateGlobalHeaderActions(targetId);
        if (wardDataReady && targetId === 'pg-prep-type' && typeof renderPrepTypePage === 'function') renderPrepTypePage();
        if (wardDataReady && targetId === 'pg-order-plan' && typeof renderOrderPlanPage === 'function') renderOrderPlanPage();
        if (wardDataReady && targetId === 'pg-nurse-schedule' && typeof renderNurseSchedulePage === 'function') renderNurseSchedulePage();
        if (wardDataReady && targetId === 'pg-emar' && typeof renderEmarPage === 'function') renderEmarPage();
        if (targetId === 'pg-nurse-prep' && typeof renderNursePrepPage === 'function') renderNursePrepPage();
        if (targetId === 'pg-pharma-report' && typeof renderPharmaReportPage === 'function') renderPharmaReportPage();
        if (targetId === 'pg-pharma-verify' && typeof renderPharmaVerifyPage === 'function') renderPharmaVerifyPage();
        if (wardDataReady && targetId === 'pg-prep-patient' && typeof renderPrepPatientPage === 'function') renderPrepPatientPage();
        if (wardDataReady && targetId === 'pg-prep-med' && typeof renderPrepMedicationPage === 'function') renderPrepMedicationPage();
        if (wardDataReady && targetId === 'pg-prep-sched' && typeof renderPrepSchedulePage === 'function') renderPrepSchedulePage();
        if (wardDataReady && targetId === 'pg-sched-detail' && typeof renderPrepScheduleDetail === 'function') renderPrepScheduleDetail();
        if (wardDataReady && targetId === 'pg-routine' && typeof renderRoutinePatientSelectionPage === 'function') {
            renderRoutinePatientSelectionPage();
            if (typeof rtGoStep === 'function') rtGoStep(1);
        }
        if (targetId === 'pg-cart') {
            cartHaUnlocked = false;
        }
        if (targetId === 'pg-prn-hw') {
            setTimeout(function() {
                prnHwCassId = '';
                var btn = document.getElementById('btnPrnHwConfirm');
                var lbl = document.getElementById('btnPrnHwLabel');
                var hint = document.getElementById('prnHwHint');
                if (btn) btn.disabled = true;
                if (lbl) lbl.textContent = 'เลือก Cassette ก่อน';
                if (hint) hint.style.display = 'flex';
                document.querySelectorAll('#prnCassGrid .cass.selected').forEach(function(c){ c.classList.remove('selected'); });
                prnRenderCassettes(prnHwDrawerNum || 1);
            }, 50);
        }
        if (targetId === 'pg-prn-fill') {
            // reset scan state when arriving
            document.getElementById('prnScanResult').style.display = 'none';
            var sb = document.getElementById('btnPrnScan');
            if (sb) { sb.disabled = true; sb.style.opacity = '0.4'; sb.style.cursor = 'not-allowed'; }
            var svb = document.getElementById('btnPrnSave');
            if (svb) { svb.disabled = true; svb.style.opacity = '0.4'; svb.style.cursor = 'not-allowed'; }
            document.getElementById('prnFillDrugName').textContent = '— เลือกยา —';
            document.getElementById('prnFillDrugMeta').textContent = 'เลือกรายการยาจากรายการด้านซ้าย';
            document.getElementById('prnScanTitle').textContent = 'เลือกรายการยาก่อน';
        }
        if (targetId === 'pg-hw') {
            setTimeout(function() {
                var btn = document.getElementById('btnHwConfirm');
                var lbl = document.getElementById('btnHwConfirmLabel');
                var hint = document.getElementById('hwSelectionHint');
                if (btn) btn.disabled = true;
                if (lbl) lbl.textContent = 'เลือก Cassette ก่อน';
                if (hint) hint.style.display = 'flex';
                document.querySelectorAll('.cass.selected').forEach(function(c){ c.classList.remove('selected'); });
                // Re-render with PRN flags for drawer 1
                var activeDw = document.querySelector('.dw-btn.active');
                if (!activeDw) { var first = document.querySelector('.dw-btn'); if (first) first.classList.add('active'); }
                renderCassettes(1);
            }, 50);
        }
        if (targetId === 'pg-fill') {
            // Reset scan hint
            var fillHint = document.getElementById('scanHint');
            var fillBtn = document.getElementById('btnConfirmFill');
            if (fillHint) fillHint.style.display = '';
            if (fillBtn) { fillBtn.style.opacity = '0.45'; }
        }
        if (wardDataReady && targetId === 'pg-stat' && typeof stRenderList === 'function') {
            stRenderList();
            if (typeof stSelectPt === 'function') stSelectPt(stSelectedIdx || 0, false);
            if (typeof stGoStep === 'function') stGoStep(1);
        }
        if (wardDataReady && targetId === 'pg-prn' && typeof prnRenderList === 'function') {
            prnRenderList();
            if (typeof prnSelectPt === 'function') prnSelectPt(prnSelectedIdx || 0, false);
            if (typeof prnGoStep === 'function') prnGoStep(1);
        }
        if (wardDataReady && targetId === 'pg-highalert' && typeof haRenderList === 'function') {
            haRenderList();
            if (typeof haSelectPt === 'function') haSelectPt(haSelectedIdx || 0, false);
            if (typeof haGoStep === 'function') haGoStep(1);
        }
        if (wardDataReady && targetId === 'pg-omit-flow' && typeof omRenderList === 'function') {
            omRenderList();
            if (typeof omSelectPt === 'function') omSelectPt(omSelectedIdx || 0, false);
            if (typeof omGoStep === 'function') omGoStep(1);
        }
        if (prepHardwareReady && prepHardwarePages.includes(targetId) && typeof renderPrepHardwareFromDashboard === 'function') {
            renderPrepHardwareFromDashboard(targetId);
        }
        return true;
    }

    function openBackofficePage() {
        try {
            sessionStorage.setItem('mcWard', currentWardName || DEFAULT_DEMO_WARD);
            sessionStorage.setItem('mcFrontPage', getActivePageId() || 'pg-dashboard');
        } catch (e) {}
        window.location.href = 'backoffice.html';
    }

    function goAppBack(fallbackPage) {
        const current = getActivePageId();
        let target = '';
        while (appNavStack.length) {
            const candidate = appNavStack.pop();
            if (!candidate || candidate === current || !document.getElementById(candidate)) continue;
            target = candidate;
            break;
        }
        if (!target) target = fallbackPage || (document.body.classList.contains('logged-in') ? 'pg-dashboard' : 'pg-cart');
        nav(target, false, { fromBack: true, replaceHistory: true });
    }

    // Browser back/forward
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            nav(e.state.page, true, { fromBack: true });
        } else {
            nav('pg-cart', true, { fromBack: true });
        }
    });

    const DEFAULT_DEMO_WARD = 'Ward 3A';
    const STANDARD_CART_DRAWERS = 6;
    const STANDARD_CART_CASSETTES = 36;
    const STANDARD_CART_CASSETTES_PER_DRAWER = STANDARD_CART_CASSETTES / STANDARD_CART_DRAWERS;
    const ORDER_PLAN_STORE = 'mcOrderPlanManualOrders';
    const EMAR_RECORD_STORE = 'mcEmarAdministrationRecords';
    var emarCurrentFilter = 'all';
    var emarSelectedRef = '';
    const EMAR_RIGHTS = [
        { key:'patient', label:'Right patient', thai:'ผู้ป่วยถูกต้อง' },
        { key:'medication', label:'Right drug', thai:'ยาถูกต้อง' },
        { key:'dose', label:'Right dose', thai:'ขนาดยาถูกต้อง' },
        { key:'route', label:'Right route', thai:'ช่องทางถูกต้อง' },
        { key:'time', label:'Right time', thai:'เวลาถูกต้อง' }
    ];
    var currentWardName = sessionStorage.getItem('mcWard') || DEFAULT_DEMO_WARD;
    var selectedWardName = currentWardName;
    var wardDataReady = false;

    /* ══════════════════════════════════════════════
       CENTRAL DATA STORE — MedCartStore
       ══════════════════════════════════════════════
       Single source of truth for all medication data.
       Every page reads from here. Changes propagate to all views.

       Status flow per order:
       ordered → scheduled → prepped → dispensed → assessed
    ══════════════════════════════════════════════ */
    var MedCartStore = {
        orders: [],   // All medication orders (physician + manual)
        offcart: [],  // Off-cart administrations
        _listeners: [],

        // Initialize with demo physician orders — per ward
        init: function(wardName) {
            wardName = wardName || currentWardName || DEFAULT_DEMO_WARD;
            this.currentWard = wardName;
            // Preserve manual orders across role switches / ward re-init
            var savedManual = this.orders ? this.orders.filter(function(o){ return o.source === 'Manual'; }) : [];
            this.offcart = [];

            if (wardName === 'Ward 5A') {
                this.orders = [
                    // ── Ward 5A: ออร์โธปิดิกส์ — 22 ผู้ป่วย, 69 คำสั่งยา ──
                    // ผู้ป่วย 01 — ภูริทัต (Post TKR day 2)
                    { id:'5A-001', source:'HIS', ward:'Ward 5A', patient:'01', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:00', highAlert:false },
                    { id:'5A-002', source:'HIS', ward:'Ward 5A', patient:'01', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:00', highAlert:false },
                    { id:'5A-027', source:'HIS', ward:'Ward 5A', patient:'01', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'รอบเย็น', time:'16:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'ordered', createdAt:'06:00', highAlert:false },
                    { id:'5A-028', source:'HIS', ward:'Ward 5A', patient:'01', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'กลางคืน', time:'00:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'ordered', createdAt:'06:00', highAlert:false },
                    { id:'5A-003', source:'HIS', ward:'Ward 5A', patient:'01', drug:'Enoxaparin 40 mg', dose:'1 syringe', route:'SC', priority:'high-alert', schedule:'OD เช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'prepped', createdAt:'06:00', highAlert:true },
                    // ผู้ป่วย 02 — ชนากานต์ (Post ORIF ankle)
                    { id:'5A-004', source:'HIS', ward:'Ward 5A', patient:'02', drug:'Celecoxib 200 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'prepped', createdAt:'06:15', highAlert:false },
                    { id:'5A-005', source:'HIS', ward:'Ward 5A', patient:'02', drug:'Omeprazole 20 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'prepped', createdAt:'06:15', highAlert:false },
                    { id:'5A-006', source:'HIS', ward:'Ward 5A', patient:'02', drug:'Tramadol 50 mg', dose:'1 เม็ด', route:'PO', priority:'prn', schedule:'PRN', time:'PRN', doctor:'พญ.สุภาวดี ข้อต่อ', status:'scheduled', createdAt:'06:15', highAlert:false },
                    // ผู้ป่วย 03 — อดิศักดิ์ (Post hip replacement)
                    { id:'5A-007', source:'HIS', ward:'Ward 5A', patient:'03', drug:'Warfarin 3 mg', dose:'1 เม็ด', route:'PO', priority:'high-alert', schedule:'ก่อนนอน', time:'20:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'scheduled', createdAt:'06:30', highAlert:true },
                    { id:'5A-008', source:'HIS', ward:'Ward 5A', patient:'03', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:30', highAlert:false },
                    { id:'5A-009', source:'HIS', ward:'Ward 5A', patient:'03', drug:'Calcium Carbonate 600 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:30', highAlert:false },
                    { id:'5A-010', source:'HIS', ward:'Ward 5A', patient:'03', drug:'Vitamin D3 1000 IU', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:30', highAlert:false },
                    // ผู้ป่วย 04 — วรวุฒิ (Post spine surgery)
                    { id:'5A-029', source:'HIS', ward:'Ward 5A', patient:'04', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:45', highAlert:false },
                    { id:'5A-011', source:'HIS', ward:'Ward 5A', patient:'04', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'รอบเที่ยง', time:'16:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'ordered', createdAt:'06:45', highAlert:false },
                    { id:'5A-030', source:'HIS', ward:'Ward 5A', patient:'04', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'กลางคืน', time:'00:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'ordered', createdAt:'06:45', highAlert:false },
                    { id:'5A-012', source:'HIS', ward:'Ward 5A', patient:'04', drug:'Morphine 5 mg', dose:'5 mg', route:'IV', priority:'high-alert', schedule:'PRN', time:'PRN', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'scheduled', createdAt:'06:45', highAlert:true },
                    { id:'5A-013', source:'HIS', ward:'Ward 5A', patient:'04', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'routine', schedule:'รอบเที่ยง', time:'12:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'dispensed', createdAt:'06:45', highAlert:false },
                    // ผู้ป่วย 05 — จิตรา (Knee arthroscopy)
                    { id:'5A-014', source:'HIS', ward:'Ward 5A', patient:'05', drug:'Gabapentin 300 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'ordered', createdAt:'07:00', highAlert:false },
                    { id:'5A-015', source:'HIS', ward:'Ward 5A', patient:'05', drug:'Celecoxib 200 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเย็น', time:'16:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'ordered', createdAt:'07:00', highAlert:false },
                    { id:'5A-016', source:'HIS', ward:'Ward 5A', patient:'05', drug:'Omeprazole 20 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเย็น', time:'16:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'dispensed', createdAt:'07:00', highAlert:false },
                    // ผู้ป่วย 06 — ธวัชชัย (Fracture fixation)
                    { id:'5A-017', source:'HIS', ward:'Ward 5A', patient:'06', drug:'Enoxaparin 40 mg', dose:'1 syringe', route:'SC', priority:'high-alert', schedule:'OD เช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'scheduled', createdAt:'07:10', highAlert:true },
                    { id:'5A-018', source:'HIS', ward:'Ward 5A', patient:'06', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'prn', schedule:'PRN', time:'PRN', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'scheduled', createdAt:'07:10', highAlert:false },
                    { id:'5A-019', source:'HIS', ward:'Ward 5A', patient:'06', drug:'Docusate 100 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'ordered', createdAt:'07:10', highAlert:false },
                    // ผู้ป่วย 07 — นลินี (Post rotator cuff repair)
                    { id:'5A-020', source:'HIS', ward:'Ward 5A', patient:'07', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'dispensed', createdAt:'06:30', highAlert:false },
                    { id:'5A-031', source:'HIS', ward:'Ward 5A', patient:'07', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'รอบเย็น', time:'16:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'ordered', createdAt:'06:30', highAlert:false },
                    { id:'5A-032', source:'HIS', ward:'Ward 5A', patient:'07', drug:'Cefazolin 1 g', dose:'1 vial', route:'IV', priority:'routine', schedule:'กลางคืน', time:'00:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'ordered', createdAt:'06:30', highAlert:false },
                    { id:'5A-021', source:'HIS', ward:'Ward 5A', patient:'07', drug:'Tramadol 50 mg', dose:'1 เม็ด', route:'PO', priority:'prn', schedule:'PRN', time:'PRN', doctor:'พญ.สุภาวดี ข้อต่อ', status:'scheduled', createdAt:'06:30', highAlert:false },
                    { id:'5A-022', source:'HIS', ward:'Ward 5A', patient:'07', drug:'Gabapentin 300 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'พญ.สุภาวดี ข้อต่อ', status:'ordered', createdAt:'06:30', highAlert:false },
                    // ผู้ป่วย 08 — เอกชัย (Multiple fractures)
                    { id:'5A-023', source:'HIS', ward:'Ward 5A', patient:'08', drug:'Aspirin 81 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'prepped', createdAt:'07:15', highAlert:false },
                    { id:'5A-024', source:'HIS', ward:'Ward 5A', patient:'08', drug:'Omeprazole 20 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'prepped', createdAt:'07:15', highAlert:false },
                    { id:'5A-025', source:'HIS', ward:'Ward 5A', patient:'08', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'routine', schedule:'รอบเย็น', time:'16:00', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'ordered', createdAt:'07:15', highAlert:false },
                    // STAT order — ผู้ป่วย 04 severe pain
                    { id:'5A-026', source:'HIS', ward:'Ward 5A', patient:'04', drug:'Ketorolac 30 mg', dose:'1 amp', route:'IV', priority:'stat', schedule:'STAT now', time:'STAT', doctor:'นพ.ธีรวัฒน์ กระดูกดี', status:'scheduled', createdAt:'07:30', highAlert:false }
                ];
            } else {
                // ── Ward 3A: อายุรกรรม — 8 ผู้ป่วย, 20 คำสั่งยา ──
                this.orders = [
                    { id:'HIS-001', source:'HIS', ward:'Ward 3A', patient:'01', drug:'Amlodipine 5 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'dispensed', createdAt:'06:30', highAlert:false },
                    { id:'HIS-002', source:'HIS', ward:'Ward 3A', patient:'01', drug:'Metformin 500 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'dispensed', createdAt:'06:30', highAlert:false },
                    { id:'HIS-003', source:'HIS', ward:'Ward 3A', patient:'01', drug:'Omeprazole 20 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'prepped', createdAt:'06:30', highAlert:false },
                    { id:'HIS-004', source:'HIS', ward:'Ward 3A', patient:'01', drug:'Heparin 5000u', dose:'1 vial', route:'SC', priority:'high-alert', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'scheduled', createdAt:'06:30', highAlert:true },
                    { id:'HIS-005', source:'HIS', ward:'Ward 3A', patient:'01', drug:'Simvastatin 20 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'ordered', createdAt:'06:30', highAlert:false },

                    { id:'HIS-021', source:'HIS', ward:'Ward 3A', patient:'02', drug:'Losartan 50 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'scheduled', createdAt:'06:20', highAlert:false },
                    { id:'HIS-022', source:'HIS', ward:'Ward 3A', patient:'02', drug:'Simvastatin 20 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'prepped', createdAt:'06:20', highAlert:false },

                    { id:'HIS-006', source:'HIS', ward:'Ward 3A', patient:'03', drug:'Amlodipine 10 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.วรรณา คำดี', status:'dispensed', createdAt:'06:15', highAlert:false },
                    { id:'HIS-007', source:'HIS', ward:'Ward 3A', patient:'03', drug:'Metformin 500 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.วรรณา คำดี', status:'dispensed', createdAt:'06:15', highAlert:false },
                    { id:'HIS-008', source:'HIS', ward:'Ward 3A', patient:'03', drug:'Enalapril 5 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.วรรณา คำดี', status:'prepped', createdAt:'06:15', highAlert:false },
                    { id:'HIS-009', source:'HIS', ward:'Ward 3A', patient:'03', drug:'Furosemide 40 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.วรรณา คำดี', status:'scheduled', createdAt:'06:15', highAlert:false },
                    { id:'HIS-024', source:'HIS', ward:'Ward 3A', patient:'03', drug:'Metformin 500 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเย็น', time:'16:00', doctor:'พญ.วรรณา คำดี', status:'ordered', createdAt:'06:15', highAlert:false },

                    { id:'HIS-010', source:'HIS', ward:'Ward 3A', patient:'05', drug:'Warfarin 3 mg', dose:'1 เม็ด', route:'PO', priority:'high-alert', schedule:'ก่อนนอน', time:'20:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'ordered', createdAt:'07:00', highAlert:true },
                    { id:'HIS-011', source:'HIS', ward:'Ward 3A', patient:'05', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'prn', schedule:'PRN', time:'PRN', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'scheduled', createdAt:'07:00', highAlert:false },
                    { id:'HIS-012', source:'HIS', ward:'Ward 3A', patient:'05', drug:'Omeprazole 20 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'prepped', createdAt:'07:00', highAlert:false },

                    { id:'HIS-013', source:'HIS', ward:'Ward 3A', patient:'08', drug:'Metformin 500 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.นภา เจริญสุข', status:'scheduled', createdAt:'06:45', highAlert:false },
                    { id:'HIS-014', source:'HIS', ward:'Ward 3A', patient:'08', drug:'Glipizide 5 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.นภา เจริญสุข', status:'scheduled', createdAt:'06:45', highAlert:false },
                    { id:'HIS-023', source:'HIS', ward:'Ward 3A', patient:'08', drug:'Atorvastatin 20 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'พญ.นภา เจริญสุข', status:'ordered', createdAt:'06:45', highAlert:false },

                    { id:'HIS-015', source:'HIS', ward:'Ward 3A', patient:'10', drug:'Paracetamol 500 mg', dose:'2 เม็ด', route:'PO', priority:'prn', schedule:'PRN', time:'PRN', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'dispensed', createdAt:'07:10', highAlert:false },
                    { id:'HIS-016', source:'HIS', ward:'Ward 3A', patient:'10', drug:'Amoxicillin 500 mg', dose:'1 แคปซูล', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'นพ.สุรศักดิ์ วงศ์แพทย์', status:'dispensed', createdAt:'07:10', highAlert:false },

                    { id:'HIS-017', source:'HIS', ward:'Ward 3A', patient:'12', drug:'Insulin Glargine 20u', dose:'20 units', route:'SC', priority:'high-alert', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.วรรณา คำดี', status:'scheduled', createdAt:'06:30', highAlert:true },

                    { id:'HIS-018', source:'HIS', ward:'Ward 3A', patient:'15', drug:'Amlodipine 5 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.นภา เจริญสุข', status:'ordered', createdAt:'07:15', highAlert:false },
                    { id:'HIS-019', source:'HIS', ward:'Ward 3A', patient:'15', drug:'Hydrochlorothiazide 25 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'รอบเช้า', time:'08:00', doctor:'พญ.นภา เจริญสุข', status:'scheduled', createdAt:'07:15', highAlert:false },

                    { id:'HIS-020', source:'HIS', ward:'Ward 3A', patient:'08', drug:'Ceftriaxone 1 g', dose:'1 vial', route:'IV', priority:'stat', schedule:'STAT now', time:'STAT', doctor:'พญ.นภา เจริญสุข', status:'scheduled', createdAt:'07:45', highAlert:false },

                    // ── Demo: Verbal/Telephone Orders ──
                    // 1 pending + 1 already approved for demo
                    { id:'MAN-DEMO-001', source:'Manual', ward:'Ward 3A', patient:'03', drug:'Diazepam 5 mg', dose:'1 เม็ด', route:'PO', priority:'routine', schedule:'ก่อนนอน', time:'20:00', doctor:'นพ.วิชัย สั่งยา', status:'pending_verify', createdAt:'09:15', highAlert:false, orderSource:'Verbal order', note:'ผู้ป่วยนอนไม่หลับ' },
                    { id:'MAN-DEMO-002', source:'Manual', ward:'Ward 3A', patient:'01', drug:'Tramadol 50 mg', dose:'1 เม็ด', route:'PO', priority:'prn', schedule:'PRN', time:'PRN', doctor:'นพ.วิชัย สั่งยา', status:'ordered', createdAt:'09:20', highAlert:false, orderSource:'Telephone order', note:'Pain score 6/10', verified:{ pharma:{ done:true, by:'ภญ.วิภา เจริญยา', at:'09:25' } } }
                ];
            }
            // Restore manual orders — overwrite hardcoded demo with saved state
            var self = this;
            try {
                savedManual.forEach(function(o) {
                    var idx = self.orders.findIndex(function(e){ return e.id === o.id; });
                    if (idx >= 0) {
                        self.orders[idx] = o;
                    } else {
                        self.orders.push(o);
                    }
                });
                // Note: drugs are re-added to patientData by syncApprovedDrugsToPatientData() called after init
            } catch(e) {}
            this._autoVerifyDoctor();
            this._notify();
        },

        /* ── 7 Rights verification per role ──
           Each order tracks who verified what:
           - doctor:  verified at prescribing (HIS orders always verified)
           - pharma:  verified before prep/dispense
           - nurse:   verified before administration
        */
        _autoVerifyDoctor: function() {
            // All HIS orders = doctor already verified at prescribing
            this.orders.forEach(function(o) {
                if (o.source === 'HIS' && !o.verified) {
                    o.verified = {
                        doctor: { done:true, by:o.doctor, at:o.createdAt, checks:{
                            drug:'เลือกยาตรงโรค/กลุ่มผู้ป่วย',
                            dose:'กำหนด dose ตาม น้ำหนัก/อายุ/โรค',
                            route:'สั่ง route ที่เหมาะสม',
                            time:'กำหนดเวลาให้ยา',
                            patient:'ระบุผู้ป่วยถูกต้องใน order'
                        }},
                        pharma: { done:false, by:null, at:null, checks:{} },
                        nurse:  { done:false, by:null, at:null, checks:{} }
                    };
                }
                // Auto-verify pharma for prepped/dispensed orders
                if (o.verified && !o.verified.pharma.done && (o.status === 'prepped' || o.status === 'dispensed' || o.status === 'assessed')) {
                    o.verified.pharma = { done:true, by:'ภญ.วิภา เจริญยา', at:o.createdAt, checks:{
                        drug:'ตรวจยาตรงใบสั่ง ไม่มียาซ้ำ/อันตราย',
                        dose:'ตรวจ dose, drug interaction, contraindication',
                        route:'ตรวจรูปแบบยาเหมาะสมกับ route',
                        time:'ตรวจยาตรงเวลา/แผน',
                        patient:'ตรวจ HN, drug allergy, ประวัติยา'
                    }};
                }
                // Auto-verify nurse for dispensed/assessed orders
                if (o.verified && !o.verified.nurse.done && (o.status === 'dispensed' || o.status === 'assessed')) {
                    o.verified.nurse = { done:true, by:'นส.สมใจ ดีมาก', at:o.createdAt, checks:{
                        drug:'ตรวจ label ยาตรงกับ eMAR',
                        dose:'ตรวจขนาดยาตรงตามที่จะให้',
                        route:'ให้ยาตาม route ที่สั่ง',
                        time:'ให้ยาตรงเวลาที่กำหนด',
                        patient:'ตรวจชื่อ-HN 2 อย่างก่อนให้ยา'
                    }};
                }
            });
        },

        // ── Query helpers ──
        getPatientName: function(patientKey) {
            var p = typeof patientData !== 'undefined' ? patientData[patientKey] : null;
            return p ? p.name : 'ผู้ป่วย ' + patientKey;
        },
        getPatientBed: function(patientKey) {
            var p = typeof patientData !== 'undefined' ? patientData[patientKey] : null;
            return p ? p.bed : '';
        },

        // Count by status
        countByStatus: function(status) { return this.orders.filter(function(o){ return o.status === status; }).length; },
        countByPriority: function(pri) { return this.orders.filter(function(o){ return o.priority === pri && o.status !== 'dispensed' && o.status !== 'assessed'; }).length; },
        countHighAlert: function() { return this.orders.filter(function(o){ return o.highAlert && o.status !== 'dispensed' && o.status !== 'assessed'; }).length; },

        // All stats for dashboard
        getDashStats: function() {
            var pipeline = this.orders.filter(function(o){ return o.status !== 'pending_verify' && o.status !== 'rejected'; });
            var total = pipeline.length;
            var dispensed = this.countByStatus('dispensed') + this.countByStatus('assessed');
            var pending = total - dispensed;
            var patients = [];
            pipeline.forEach(function(o) { if (patients.indexOf(o.patient) === -1) patients.push(o.patient); });
            return {
                patients: patients.length,
                totalMeds: total,
                done: dispensed,
                pending: pending,
                pctDone: total > 0 ? Math.round(dispensed / total * 100) : 0,
                highAlert: this.countHighAlert(),
                stat: this.countByPriority('stat'),
                prn: this.countByPriority('prn')
            };
        },

        // Orders grouped by schedule for Nurse Schedule
        getBySchedule: function() {
            var groups = {};
            this.orders.forEach(function(o) {
                var key = o.schedule || 'อื่นๆ';
                if (!groups[key]) groups[key] = [];
                groups[key].push(o);
            });
            return groups;
        },

        // Add manual order (Verbal/Telephone)
        addManualOrder: function(order) {
            order.id = 'MAN-' + Date.now();
            order.source = 'Manual';
            order.status = 'pending_verify';
            order.createdAt = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
            this.orders.push(order);
            this._notify();
            return order;
        },

        // Pharmacist approves a pending order → enters normal pipeline
        approveOrder: function(orderId, pharmacistName) {
            var order = this.orders.find(function(o){ return o.id === orderId; });
            if (order && order.status === 'pending_verify') {
                order.status = 'ordered';
                order.verified = order.verified || {};
                order.verified.pharma = { done:true, by:pharmacistName || 'ภญ.วิภา เจริญยา', at:new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) };
                // Add approved drug to patientData so prep flow can see it
                if (typeof patientData !== 'undefined' && order.patient && patientData[order.patient]) {
                    var pt = patientData[order.patient];
                    pt.drugs = pt.drugs || [];
                    var exists = pt.drugs.some(function(d){ return d.manualOrderId === order.id; });
                    if (!exists) {
                        var scheduleMap = {'รอบเช้า':'OD เช้า','รอบเที่ยง':'OD เที่ยง','รอบเย็น':'OD เย็น','ก่อนนอน':'OD ก่อนนอน','STAT now':'STAT','PRN':'PRN'};
                        pt.drugs.push({
                            name: order.drug,
                            dose: order.dose || order.drug,
                            route: order.route || 'PO',
                            freq: scheduleMap[order.schedule] || order.schedule || '',
                            schedule: order.schedule || '',
                            time: order.time || '',
                            color: order.priority === 'stat' ? '#EF4444' : order.priority === 'high-alert' ? '#D97706' : '#7C3AED',
                            highAlert: order.priority === 'high-alert',
                            manualOrderId: order.id,
                            source: 'Manual',
                            doctor: order.doctor || ''
                        });
                    }
                }
                this._notify();
            }
        },

        // Pharmacist rejects a pending order
        rejectOrder: function(orderId, pharmacistName, reason) {
            var order = this.orders.find(function(o){ return o.id === orderId; });
            if (order && order.status === 'pending_verify') {
                order.status = 'rejected';
                order.rejectedBy = pharmacistName || 'ภญ.วิภา เจริญยา';
                order.rejectedAt = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
                order.rejectReason = reason || '';
                this._notify();
            }
        },

        // Count pending verification orders
        countPendingVerify: function() {
            return this.orders.filter(function(o){ return o.status === 'pending_verify'; }).length;
        },

        // Update order status
        updateStatus: function(orderId, newStatus) {
            var order = this.orders.find(function(o){ return o.id === orderId; });
            if (order) { order.status = newStatus; this._notify(); }
        },

        // Add off-cart record
        addOffcart: function(record) {
            record.id = 'OFF-' + Date.now();
            record.timestamp = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
            this.offcart.push(record);
            this._notify();
        },

        // ── Listener system (notify all pages on change) ──
        onChange: function(fn) { this._listeners.push(fn); },
        _notify: function() {
            var self = this;
            this._listeners.forEach(function(fn){ try { fn(self); } catch(e){} });
        }
    };

    // ── PatientData Notifier — pub/sub for patientData changes ──
    var PatientDataNotifier = {
        _listeners: [],
        _debounceTimer: null,
        onChange: function(fn) { this._listeners.push(fn); },
        notify: function() {
            var self = this;
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(function() {
                self._listeners.forEach(function(fn) { try { fn(); } catch(e) { console.warn('[PatientDataNotifier]', e); } });
            }, 50);
        }
    };

    // ── Unified active-page re-render ──
    function renderActivePage() {
        var pg = getActivePageId();
        if (!pg || !wardDataReady) return;
        var map = {
            'pg-dashboard':       function() {
                syncDashboardFromStore();
                if (typeof renderDashboardDynamic === 'function') renderDashboardDynamic();
                if (typeof renderDashActivityLog === 'function') renderDashActivityLog();
                if (typeof renderDashScheduleTimeline === 'function') renderDashScheduleTimeline();
                var sec = document.getElementById('dashRoleSection');
                if (sec && typeof getRoleSectionHTML === 'function') sec.innerHTML = getRoleSectionHTML(currentRole);
                var pvBadge = document.getElementById('dashPendingVerifyCount');
                if (pvBadge) pvBadge.textContent = MedCartStore.countPendingVerify();
                var nursePrepBtn = document.getElementById('dashNursePrepLink');
                if (nursePrepBtn && currentRole === 'nurse') {
                    var approved = MedCartStore.orders.filter(function(o){ return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected'; }).length;
                    var npBadge = document.getElementById('dashNursePrepCount');
                    if (npBadge) npBadge.textContent = approved;
                    var npSub = document.getElementById('dashNursePrepSub');
                    if (approved > 0) {
                        nursePrepBtn.style.opacity = '';
                        nursePrepBtn.style.pointerEvents = '';
                        nursePrepBtn.style.borderColor = '#86EFAC';
                        nursePrepBtn.style.background = 'linear-gradient(135deg,#F0FDF4,#DCFCE7)';
                        if (npSub) npSub.textContent = approved + ' รายการพร้อมจัด';
                    } else {
                        nursePrepBtn.style.opacity = '0.5';
                        nursePrepBtn.style.pointerEvents = 'none';
                        nursePrepBtn.style.borderColor = '#E2E8F0';
                        nursePrepBtn.style.background = '#F8FAFC';
                        if (npSub) npSub.textContent = 'ยังไม่มีรายการอนุมัติ';
                    }
                    var cassettePanel = document.getElementById('dashCassettePanel');
                    if (cassettePanel) cassettePanel.style.display = approved > 0 ? '' : 'none';
                }
                if (typeof updateDashPrnBadge === 'function') updateDashPrnBadge();
            },
            'pg-prep-type':       function() { if (typeof renderPrepTypePage === 'function') renderPrepTypePage(); },
            'pg-order-plan':      function() { if (typeof renderOrderPlanPage === 'function') renderOrderPlanPage(); },
            'pg-nurse-schedule':  function() { if (typeof renderNurseSchedulePage === 'function') renderNurseSchedulePage(); },
            'pg-emar':            function() { if (typeof renderEmarPage === 'function') renderEmarPage(); },
            'pg-nurse-prep':      function() { if (typeof renderNursePrepPage === 'function') renderNursePrepPage(); },
            'pg-pharma-report':   function() { if (typeof renderPharmaReportPage === 'function') renderPharmaReportPage(); },
            'pg-pharma-verify':   function() { if (typeof renderPharmaVerifyPage === 'function') renderPharmaVerifyPage(); },
            'pg-prep-patient':    function() { if (typeof renderPrepPatientPage === 'function') renderPrepPatientPage(); },
            'pg-prep-med':        function() { if (typeof renderPrepMedicationPage === 'function') renderPrepMedicationPage(); },
            'pg-prep-sched':      function() { if (typeof renderPrepSchedulePage === 'function') renderPrepSchedulePage(); },
            'pg-sched-detail':    function() { if (typeof renderPrepScheduleDetail === 'function') renderPrepScheduleDetail(); },
            'pg-routine':         function() { if (typeof renderRoutinePatientSelectionPage === 'function') renderRoutinePatientSelectionPage(); },
            'pg-stat':            function() { if (typeof stRenderList === 'function') stRenderList(); },
            'pg-prn':             function() { if (typeof prnRenderList === 'function') prnRenderList(); },
            'pg-highalert':       function() { if (typeof haRenderList === 'function') haRenderList(); },
            'pg-omit-flow':       function() { if (typeof omRenderList === 'function') omRenderList(); },
            'pg-overdue':         function() { if (typeof ovRenderList === 'function') ovRenderList(); },
            'pg-dispense':        function() { if (typeof renderDispenseList === 'function') renderDispenseList(); },
            'pg-prep-pt-drugs':   function() { if (typeof npGoPrep === 'function') npGoPrep(currentPatientBed); },
            'pg-summary':         function() { if (typeof renderPrepSummary === 'function') renderPrepSummary(); }
        };
        var fn = map[pg];
        if (fn) fn();
    }

    // ── Dashboard sync function ──
    function syncDashboardFromStore() {
        var s = MedCartStore.getDashStats();
        var el;
        el = document.getElementById('dashStatPatients'); if (el) el.textContent = s.patients;
        el = document.getElementById('dashStatMeds'); if (el) el.textContent = s.totalMeds;
        el = document.getElementById('dashStatDone'); if (el) el.textContent = s.done;
        el = document.getElementById('dashStatPending'); if (el) el.textContent = s.pending;
        el = document.getElementById('dashStatDoneBar'); if (el) el.style.width = s.pctDone + '%';
        el = document.getElementById('dashStatPendingBar'); if (el) el.style.width = (100 - s.pctDone) + '%';
        // Banner text
        el = document.querySelector('.db-banner-sub');
        if (el) el.innerHTML = 'มีรายการยา <strong style="color:var(--green);">' + s.pending + ' รายการ</strong> รอดำเนินการ · จ่ายแล้ว <strong style="color:var(--green);">' + s.done + ' จาก ' + s.totalMeds + '</strong> รายการ';
        // Progress donut (update stroke-dashoffset)
        var donutCircle = document.querySelector('.db-progress svg circle:nth-child(2)');
        if (donutCircle) {
            var circumference = 2 * Math.PI * parseFloat(donutCircle.getAttribute('r'));
            donutCircle.setAttribute('stroke-dasharray', circumference);
            donutCircle.setAttribute('stroke-dashoffset', circumference * (1 - s.pctDone / 100));
        }
        el = document.querySelector('.db-progress-num'); if (el) el.textContent = s.pctDone + '%';
        // Quick links counts
        el = document.getElementById('dashOrderPlanCount'); if (el) el.textContent = s.totalMeds + ' รายการ';
        el = document.getElementById('dashNurseScheduleCount');
        if (el) el.textContent = MedCartStore.countByStatus('ordered') + ' รอจัด';
        el = document.getElementById('dashEmarCount');
        if (el) el.textContent = (s.totalMeds - s.done) + ' รอให้ยา';
        // STAT alert badge
        var statBadge = document.querySelector('#dashQuickAlerts .db-alert-num');
        if (statBadge) statBadge.textContent = s.stat;
        // eMAR 7 Rights counters
        el = document.getElementById('emar7rPending'); if (el) el.textContent = s.pending;
        el = document.getElementById('emar7rPassed'); if (el) el.textContent = s.done;
    }

    // ── Render physician orders in Order Plan ──
    // ── View state ──
    var opDrPhView = 'patient'; // default: ตามผู้ป่วย
    var opPhRnView = 'patient'; // default: ตามผู้ป่วย

    function opSetDrPhView(view) {
        opDrPhView = view;
        document.getElementById('opDrPhViewDrug').style.background = view === 'drug' ? '#0D9488' : 'white';
        document.getElementById('opDrPhViewDrug').style.color = view === 'drug' ? 'white' : 'var(--text-2)';
        document.getElementById('opDrPhViewPatient').style.background = view === 'patient' ? '#0D9488' : 'white';
        document.getElementById('opDrPhViewPatient').style.color = view === 'patient' ? 'white' : 'var(--text-2)';
        renderPhysicianOrders();
    }
    function opSetPhRnView(view) {
        opPhRnView = view;
        document.getElementById('opPhRnViewPatient').style.background = view === 'patient' ? '#7C3AED' : 'white';
        document.getElementById('opPhRnViewPatient').style.color = view === 'patient' ? 'white' : 'var(--text-2)';
        document.getElementById('opPhRnViewDrug').style.background = view === 'drug' ? '#7C3AED' : 'white';
        document.getElementById('opPhRnViewDrug').style.color = view === 'drug' ? 'white' : 'var(--text-2)';
        renderPharmaToNurseOrders();
    }

    // Auto-set default view based on role
    function opApplyRoleDefaults() {
        if (typeof currentRole !== 'undefined') {
            opDrPhView = 'patient';
            opPhRnView = 'patient';
        }
    }

    // ── Render single order row ──
    function opRenderOrderRow(o) {
        var priorityTag = o.priority === 'stat' ? '<span class="op-tag stat">STAT</span>'
            : o.priority === 'high-alert' ? '<span class="op-tag ha">High Alert</span>'
            : o.priority === 'prn' ? '<span class="op-tag prn">PRN</span>'
            : '<span class="op-tag">Routine</span>';
        var statusTag = o.status === 'dispensed' || o.status === 'assessed' ? '<span class="op-tag done">จ่ายยาแล้ว</span>'
            : o.status === 'prepped' ? '<span class="op-tag done">จัดยาแล้ว</span>'
            : o.status === 'scheduled' ? '<span class="op-tag">รอจัดยา</span>'
            : '<span class="op-tag">รับคำสั่ง</span>';
        var borderColor = o.priority === 'stat' ? '#EF4444' : o.highAlert ? '#D97706' : '#0D9488';
        var ptName = MedCartStore.getPatientName(o.patient);
        var ptBed = MedCartStore.getPatientBed(o.patient);
        var isDone = o.status === 'dispensed' || o.status === 'assessed';
        var navTarget = o.priority === 'stat' ? 'pg-stat' : o.priority === 'prn' ? 'pg-prn' : o.priority === 'high-alert' ? 'pg-highalert' : 'pg-routine';
        var actionHtml = !isDone
            ? '<button type="button" class="op-btn' + (o.priority === 'stat' ? ' primary' : '') + '" style="font-size:11px;padding:7px 12px;" onclick="nav(\'' + navTarget + '\')">ดำเนินการ <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
            : '<span style="font-size:10px;color:var(--text-3);">' + o.createdAt + '</span>';
        var verifyHtml = o.verified ? (
            (o.verified.doctor && o.verified.doctor.done ? '<span class="op-tag" style="background:#DBEAFE;color:#1D4ED8;border-color:#93C5FD;font-size:9px;">Dr ✓</span>' : '')
            + (o.verified.pharma && o.verified.pharma.done ? '<span class="op-tag" style="background:#F0FDFA;color:#0F766E;border-color:#99F6E4;font-size:9px;">Ph ✓</span>' : '')
            + (o.verified.nurse && o.verified.nurse.done ? '<span class="op-tag" style="background:#F5F3FF;color:#6D28D9;border-color:#DDD6FE;font-size:9px;">RN ✓</span>' : '')
        ) : '';
        return '<div class="op-order-row" style="border-left-color:' + borderColor + ';">'
            + '<div class="op-order-main">'
            + '<div class="op-order-name">' + escHtml(o.drug) + ' <span class="op-tag">' + escHtml(o.route) + '</span> ' + priorityTag + '</div>'
            + '<div class="op-order-meta">' + escHtml(ptName) + ' · ห้อง ' + escHtml(ptBed) + ' · สั่งโดย <strong>' + escHtml(o.doctor) + '</strong></div>'
            + '<div class="op-order-tags"><span class="op-tag" style="background:#F0FDFA;color:#0F766E;border-color:#CCFBF1;">' + escHtml(o.source) + '</span><span class="op-tag">' + escHtml(o.schedule) + (o.time && o.time !== 'STAT' && o.time !== 'PRN' ? ' ' + o.time : '') + '</span>' + statusTag + verifyHtml + '</div>'
            + '</div>'
            + '<div class="op-row-actions">' + actionHtml + '</div></div>';
    }

    // ── Group orders by patient ──
    function opGroupByPatient(orders) {
        var groups = {};
        orders.forEach(function(o) {
            if (!groups[o.patient]) groups[o.patient] = [];
            groups[o.patient].push(o);
        });
        var html = '';
        Object.keys(groups).forEach(function(key) {
            var items = groups[key];
            var ptName = MedCartStore.getPatientName(key);
            var ptBed = MedCartStore.getPatientBed(key);
            var doneCount = items.filter(function(o){ return o.status === 'dispensed' || o.status === 'assessed'; }).length;
            html += '<div style="margin-bottom:14px;">'
                + '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg);border-radius:10px;margin-bottom:6px;">'
                + '<div style="width:32px;height:32px;background:linear-gradient(135deg,var(--green),#14B8A6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;flex-shrink:0;">' + escHtml(ptName.replace(/^(นาย|นางสาว|นาง|นส\.)\s*/,'').slice(0,2)) + '</div>'
                + '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text-1);">' + escHtml(ptName) + '</div>'
                + '<div style="font-size:11px;color:var(--text-3);">ห้อง ' + escHtml(ptBed) + ' · ' + items.length + ' รายการ · ' + doneCount + ' จ่ายแล้ว</div></div></div>'
                + items.map(opRenderOrderRow).join('')
                + '</div>';
        });
        return html;
    }

    // ── Dr → Ph: Physician Orders ──
    function renderPhysicianOrders() {
        var container = document.getElementById('opPhysicianOrders');
        if (!container) return;
        // Dr→Ph shows orders not yet fully prepped (ordered + scheduled + prepped)
        var orders = MedCartStore.orders.filter(function(o){ return o.source === 'HIS'; });
        if (!orders.length) { container.innerHTML = '<div class="op-empty">ยังไม่มีคำสั่งยาจากแพทย์</div>'; return; }
        if (opDrPhView === 'patient') {
            container.innerHTML = opGroupByPatient(orders);
        } else {
            container.innerHTML = orders.map(opRenderOrderRow).join('');
        }
    }

    // ── Ph → RN: Verified/Prepped Orders ready for nurse ──
    function renderPharmaToNurseOrders() {
        var container = document.getElementById('opPharmaToNurseOrders');
        if (!container) return;
        var countEl = document.getElementById('opPhRnCount');
        // Ph→RN shows orders that pharma verified (prepped + dispensed)
        var orders = MedCartStore.orders.filter(function(o) {
            return o.verified && o.verified.pharma && o.verified.pharma.done;
        });
        if (countEl) countEl.textContent = orders.filter(function(o){ return o.status === 'prepped'; }).length + ' พร้อมจ่าย';
        if (!orders.length) { container.innerHTML = '<div class="op-empty">ยังไม่มียาที่เภสัชตรวจแล้ว</div>'; return; }
        if (opPhRnView === 'patient') {
            container.innerHTML = opGroupByPatient(orders);
        } else {
            container.innerHTML = orders.map(opRenderOrderRow).join('');
        }
    }

    // ── Sync Order Plan stats ──
    function syncOrderPlanStats() {
        var s = MedCartStore.getDashStats();
        var el;
        el = document.getElementById('opTotalOrders'); if (el) el.textContent = s.totalMeds;
        el = document.getElementById('opPendingOrders'); if (el) el.textContent = MedCartStore.countByStatus('scheduled') + MedCartStore.countByStatus('ordered');
        el = document.getElementById('opHighAlertOrders'); if (el) el.textContent = s.highAlert;
        el = document.getElementById('opPrnOrders'); if (el) el.textContent = s.stat + s.prn;
        // eMAR stats
        el = document.getElementById('emarTotalItems'); if (el) el.textContent = s.totalMeds;
        el = document.getElementById('emarPendingItems'); if (el) el.textContent = s.pending;
        el = document.getElementById('emarDoneItems'); if (el) el.textContent = s.done;
        el = document.getElementById('emarOffCartItems'); if (el) el.textContent = MedCartStore.offcart.length;
        // Nurse Schedule stats
        el = document.getElementById('nsTotalOrders'); if (el) el.textContent = s.totalMeds;
        el = document.getElementById('nsPendingPrep'); if (el) el.textContent = MedCartStore.countByStatus('scheduled') + MedCartStore.countByStatus('ordered');
        el = document.getElementById('nsPrepared'); if (el) el.textContent = MedCartStore.countByStatus('prepped');
        el = document.getElementById('nsGiven'); if (el) el.textContent = s.done;
    }

    function renderDashScheduleTimeline() {
        var container = document.getElementById('dashScheduleTimeline');
        var countEl   = document.getElementById('dashScheduleCount');
        if (!container || typeof MedCartStore === 'undefined') return;
        var groups = MedCartStore.getBySchedule();
        var SLOTS = [
            { key:'รอบเช้า',   time:'08:00', name:'เช้า',     iconPath:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
            { key:'รอบเที่ยง', time:'12:00', name:'กลางวัน',  iconPath:'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' },
            { key:'รอบเย็น',   time:'16:00', name:'เย็น',     iconPath:'<path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>' },
            { key:'ก่อนนอน',  time:'20:00', name:'ก่อนนอน',  iconPath:'<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>' }
        ];
        var activeKey = '';
        SLOTS.forEach(function(s) {
            if (!activeKey && groups[s.key] && groups[s.key].some(function(o){ return o.status !== 'dispensed' && o.status !== 'assessed'; })) activeKey = s.key;
        });
        if (countEl) countEl.textContent = 'รอบปัจจุบัน: ' + (activeKey === 'รอบเช้า' ? 'เช้า' : activeKey === 'รอบเที่ยง' ? 'กลางวัน' : activeKey === 'รอบเย็น' ? 'เย็น' : activeKey === 'ก่อนนอน' ? 'ก่อนนอน' : '—');
        container.innerHTML = SLOTS.map(function(slot) {
            var items = groups[slot.key] || [];
            var done  = items.filter(function(o){ return o.status === 'dispensed' || o.status === 'assessed'; }).length;
            var total = items.length;
            var patients = [];
            items.forEach(function(o){ if (patients.indexOf(o.patient) < 0) patients.push(o.patient); });
            var isActive = slot.key === activeKey;
            var isDone   = total > 0 && done === total;
            var iconColor = isActive ? '#fff' : isDone ? '#059669' : '#94A3B8';
            var countClass = isDone ? 'db2-slot-count db2-slot-done' : 'db2-slot-count';
            var countText = total > 0 ? patients.length + ' คน' : '—';
            return '<div class="db2-slot' + (isActive ? ' db2-slot--active' : '') + '" onclick="nav(\'pg-routine\')">'
                + '<div class="db2-slot-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + iconColor + '" stroke-width="2">' + slot.iconPath + '</svg></div>'
                + '<div class="db2-slot-time">' + slot.time + '</div>'
                + '<div class="db2-slot-name">' + slot.name + '</div>'
                + '<div class="' + countClass + '">' + countText + '</div>'
                + '</div>';
        }).join('');
    }

    // Register listeners
    MedCartStore.onChange(syncDashboardFromStore);
    MedCartStore.onChange(function() { opApplyRoleDefaults(); renderPhysicianOrders(); renderPharmaToNurseOrders(); });
    MedCartStore.onChange(syncOrderPlanStats);
    MedCartStore.onChange(renderDashScheduleTimeline);

    // ── Nurse Schedule Calendar Renderer ──
    function renderNsCalendar() {
        var body = document.getElementById('nsCalendarBody');
        if (!body || typeof MedCartStore === 'undefined' || !MedCartStore.orders.length) return;

        var rounds = ['รอบเช้า','รอบเที่ยง','รอบเย็น','ก่อนนอน'];
        var roundAlt = { 'OD เช้า':'รอบเช้า', 'OD ก่อนนอน':'ก่อนนอน' };
        function toRound(sched) { return roundAlt[sched] || (rounds.indexOf(sched) >= 0 ? sched : null); }

        // Group orders by patient
        var patients = {};
        MedCartStore.orders.forEach(function(o) {
            if (o.schedule === 'STAT now' || o.schedule === 'PRN') return; // separate section
            var r = toRound(o.schedule);
            if (!r) return;
            if (!patients[o.patient]) patients[o.patient] = { morning:[], noon:[], evening:[], bedtime:[] };
            var slot = r === 'รอบเช้า' ? 'morning' : r === 'รอบเที่ยง' ? 'noon' : r === 'รอบเย็น' ? 'evening' : 'bedtime';
            patients[o.patient][slot].push(o);
        });

        var keys = Object.keys(patients);
        if (!keys.length) { body.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-3);font-size:12px;">ไม่มีรายการยาตามรอบเวลา</div>'; return; }

        function drugPill(o) {
            var isDone = o.status === 'dispensed' || o.status === 'assessed';
            var isPrepped = o.status === 'prepped';
            var isHA = o.highAlert;
            var bg = isDone ? '#DCFCE7' : isPrepped ? '#DBEAFE' : isHA ? '#FEF2F2' : '#F1F5F9';
            var color = isDone ? '#15803D' : isPrepped ? '#1D4ED8' : isHA ? '#DC2626' : '#475569';
            var border = isDone ? '#BBF7D0' : isPrepped ? '#93C5FD' : isHA ? '#FECACA' : '#E2E8F0';
            var icon = isDone ? '✓ ' : isHA ? '⚠ ' : '';
            var isPh = (typeof currentRole !== 'undefined' && currentRole === 'pharma');
            /* Pending/prepped pills open Quick Dispense Sheet; done pills show eMAR */
            var clickAttr = '';
            var cursorStyle = 'cursor:default;';
            if (!isPh) {
                if (isDone) {
                    clickAttr = ' onclick="nav(\'pg-emar\')"';
                    cursorStyle = 'cursor:pointer;';
                } else {
                    clickAttr = ' onclick="nsOpenPatient(\'' + o.patient + '\')"';
                    cursorStyle = 'cursor:pointer;';
                }
            }
            return '<div style="background:'+bg+';color:'+color+';border:1px solid '+border+';border-radius:6px;padding:3px 7px;font-size:9px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'+cursorStyle+'" title="'+escHtml(o.drug)+' · '+escHtml(o.dose)+' · '+o.route+'"'+clickAttr+'>'
                + icon + escHtml(o.drug.split(' ')[0]) + '</div>';
        }

        function cellHtml(orders) {
            if (!orders.length) return '<div style="padding:6px 8px;color:#CBD5E1;font-size:9px;text-align:center;">—</div>';
            return '<div style="padding:6px 8px;display:flex;flex-direction:column;gap:3px;">' + orders.map(drugPill).join('') + '</div>';
        }

        body.innerHTML = keys.map(function(key, idx) {
            var pt = patients[key];
            var ptName = MedCartStore.getPatientName(key);
            var ptBed = MedCartStore.getPatientBed(key);
            var shortName = ptName.replace(/^(นาย|นางสาว|นาง|นส\.)\s*/,'');
            var initials = shortName.slice(0,2);
            var totalDrugs = pt.morning.length + pt.noon.length + pt.evening.length + pt.bedtime.length;
            var borderB = idx < keys.length - 1 ? 'border-bottom:1px solid var(--border-light);' : '';
            return '<div style="display:grid;grid-template-columns:120px 1fr;'+borderB+'">'
                + '<div style="padding:10px 12px;display:flex;align-items:center;gap:8px;border-right:1px solid var(--border-light);cursor:pointer;" onclick="nsOpenPatient(\'' + key + '\')">'
                + '<div style="width:28px;height:28px;background:linear-gradient(135deg,var(--green),#14B8A6);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;flex-shrink:0;">'+escHtml(initials)+'</div>'
                + '<div style="min-width:0;"><div style="font-size:11px;font-weight:700;color:var(--text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+escHtml(shortName)+'</div>'
                + '<div style="font-size:9px;color:var(--text-3);">'+escHtml(ptBed)+' · '+totalDrugs+' ยา</div></div>'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:repeat(4,1fr);">'
                + '<div style="border-right:1px solid var(--border-light);">'+cellHtml(pt.morning)+'</div>'
                + '<div style="border-right:1px solid var(--border-light);">'+cellHtml(pt.noon)+'</div>'
                + '<div style="border-right:1px solid var(--border-light);">'+cellHtml(pt.evening)+'</div>'
                + '<div>'+cellHtml(pt.bedtime)+'</div>'
                + '</div></div>';
        }).join('');
    }
    MedCartStore.onChange(renderNsCalendar);

    // ── Open patient in Routine step 2 from Nurse Schedule ──
    function nsOpenPatient(patientKey) {
        nav('pg-routine');          // shows pg-routine, internally calls rtGoStep(1)
        rtSelectPatient(patientKey); // cleans up old drugs, populates step 2 & 3, calls rtGoStep(2)
    }

    // ── Quick Dispense Sheet ──────────────────────────────
    var _nsQdOrderId = null;

    function nsOpenQd(orderId) {
        var o = MedCartStore.orders.find(function(x){ return x.id === orderId; });
        if (!o) return;
        _nsQdOrderId = orderId;

        var isDone = o.status === 'dispensed' || o.status === 'assessed';
        if (isDone) { nav('pg-emar'); return; }

        var ptName = MedCartStore.getPatientName(o.patient);
        var ptBed  = MedCartStore.getPatientBed(o.patient);
        var shortName = ptName.replace(/^(นาย|นางสาว|นาง|นส\.)\s*/, '');
        var initials = shortName.slice(0, 2);

        var isHA = o.highAlert;
        var isPrepped = o.status === 'prepped';
        var iconBg = isHA ? '#FEF2F2' : isPrepped ? '#EFF6FF' : '#F0FDFA';
        var iconColor = isHA ? '#DC2626' : isPrepped ? '#2563EB' : '#0D9488';

        // Drug icon
        var iconEl = document.getElementById('nsQdDrugIcon');
        if (iconEl) {
            iconEl.style.background = iconBg;
            iconEl.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="'+iconColor+'" stroke-width="2"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="12" y1="6" x2="12" y2="12"/></svg>';
        }

        // Texts
        setText('nsQdDrugName', o.drug);
        setText('nsQdDrugSub', o.dose + ' · ' + o.route + (o.time ? ' · ' + o.time + ' น.' : ''));
        setText('nsQdPtAvatar', initials);
        setText('nsQdPtName', ptName);
        setText('nsQdPtMeta', ptBed + (o.patient ? ' · HN: ' + o.patient.padStart(7,'0') : ''));
        setText('nsQdRoute', o.route);
        setText('nsQdScheduledTime', o.time ? o.time + ' น.' : o.schedule);

        // High Alert banner
        var haBanner = document.getElementById('nsQdHaBanner');
        if (haBanner) haBanner.style.display = isHA ? 'flex' : 'none';

        // Pre-check all rights
        document.querySelectorAll('#nsQdSheet .ns-qd-right-row').forEach(function(r){ r.classList.add('checked'); });
        nsUpdateConfirmBtn();

        // Set current time
        var now = new Date();
        var hh = String(now.getHours()).padStart(2,'0');
        var mm = String(now.getMinutes()).padStart(2,'0');
        var ti = document.getElementById('nsQdTimeInput');
        if (ti) ti.value = hh + ':' + mm;

        // Open overlay
        document.getElementById('nsQdOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function nsCloseQd() {
        document.getElementById('nsQdOverlay').classList.remove('open');
        document.body.style.overflow = '';
        _nsQdOrderId = null;
    }

    function nsToggleRight(row) {
        row.classList.toggle('checked');
        nsUpdateConfirmBtn();
    }

    function nsUpdateConfirmBtn() {
        var allChecked = document.querySelectorAll('#nsQdSheet .ns-qd-right-row:not(.checked)').length === 0;
        var btn = document.getElementById('nsQdConfirmBtn');
        if (btn) btn.disabled = !allChecked;
    }

    function nsConfirmDispense() {
        if (!_nsQdOrderId) return;
        var btn = document.getElementById('nsQdConfirmBtn');
        if (btn) { btn.classList.add('loading'); btn.disabled = true; }

        // Simulate brief network delay
        setTimeout(function() {
            MedCartStore.updateStatus(_nsQdOrderId, 'dispensed');
            MedCartStore._autoVerifyDoctor && MedCartStore._autoVerifyDoctor.call(MedCartStore);
            MedCartStore._notify && MedCartStore._notify.call(MedCartStore);
            nsCloseQd();
            if (btn) { btn.classList.remove('loading'); }
            showToast('บันทึกการให้ยาเรียบร้อยแล้ว');
            setTimeout(function(){ showToast(''); }, 2500);
        }, 600);
    }

    function setText(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val || '—';
    }

    // ── Dashboard Activity Log — dynamic from MedCartStore ──
    function renderDashActivityLog() {
        var wrap = document.getElementById('dashActivityLogWrap');
        if (!wrap || typeof MedCartStore === 'undefined') return;
        var shortName = function(n) { return String(n||'').replace(/^(นาย|นาง|นางสาว|นส\.|ด\.ช\.|ด\.ญ\.)\s*/,''); };

        // Icon templates
        var icoDispense = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        var icoPrep = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4z"/></svg>';
        var icoOmit = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        var icoPendingVerify = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        var icoApproved = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

        var items = [];
        var orders = (MedCartStore.orders || []).slice();

        // Dispensed / assessed — จ่ายยา
        orders.filter(function(o){ return o.status === 'dispensed' || o.status === 'assessed'; })
            .forEach(function(o) {
                items.push({
                    ico: icoDispense, bg:'#f0fdf4',
                    text: 'จ่ายยา <strong>' + escHtml(o.drug) + '</strong>',
                    sub: shortName(MedCartStore.getPatientName(o.patient)) + ' · ' + MedCartStore.getPatientBed(o.patient),
                    time: o.time || o.createdAt || '',
                    sortKey: (o.time && /^\d/.test(o.time)) ? o.time : (o.createdAt || '00:00')
                });
            });

        // Prepped — จัดยา
        orders.filter(function(o){ return o.status === 'prepped'; })
            .forEach(function(o) {
                items.push({
                    ico: icoPrep, bg:'#eff6ff',
                    text: 'จัดยา <strong>' + escHtml(o.drug) + '</strong>',
                    sub: shortName(MedCartStore.getPatientName(o.patient)) + ' · ' + MedCartStore.getPatientBed(o.patient),
                    time: o.createdAt || '',
                    sortKey: o.createdAt || '00:00'
                });
            });

        // Manual orders: pending verify — รอเภสัชอนุมัติ
        orders.filter(function(o){ return o.source === 'Manual' && o.status === 'pending_verify'; })
            .forEach(function(o) {
                items.push({
                    ico: icoPendingVerify, bg:'#f5f3ff',
                    text: 'Verbal order <strong>' + escHtml(o.drug) + '</strong> · รอเภสัชอนุมัติ',
                    sub: shortName(MedCartStore.getPatientName(o.patient)) + ' · ' + (o.doctor || '—'),
                    time: o.createdAt || '',
                    sortKey: o.createdAt || '00:00'
                });
            });

        // Manual orders: approved — เภสัชอนุมัติ
        orders.filter(function(o){ return o.source === 'Manual' && o.verified && o.verified.pharma && o.verified.pharma.done; })
            .forEach(function(o) {
                items.push({
                    ico: icoApproved, bg:'#f0fdf4',
                    text: 'เภสัชอนุมัติ <strong>' + escHtml(o.drug) + '</strong>',
                    sub: shortName(MedCartStore.getPatientName(o.patient)) + ' · ' + (o.verified.pharma.by || 'เภสัช'),
                    time: o.verified.pharma.at || o.createdAt || '',
                    sortKey: o.verified.pharma.at || o.createdAt || '00:00'
                });
            });

        // Sort by time desc (latest first) — pick top 6
        items.sort(function(a,b) { return String(b.sortKey).localeCompare(String(a.sortKey)); });
        items = items.slice(0, 6);

        if (!items.length) {
            wrap.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:12px;">ยังไม่มีกิจกรรม</div>';
            return;
        }

        wrap.innerHTML = items.map(function(it, idx) {
            var isLast = idx === items.length - 1;
            var border = isLast ? '' : 'border-bottom:1px dashed #f1f5f9;';
            return '<div class="db-log-item" style="' + border + 'padding:10px 8px;">'
                + '<div style="width:32px;height:32px;background:' + it.bg + ';border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + it.ico + '</div>'
                + '<div style="flex:1;min-width:0;"><div class="db-log-text">' + it.text + '</div>'
                + '<div style="font-size:11px;color:var(--text-3);">' + escHtml(it.sub) + '</div></div>'
                + '<div class="db-log-time">' + escHtml(it.time) + '</div>'
                + '</div>';
        }).join('');
    }
    MedCartStore.onChange(renderDashActivityLog);

    // ── Dynamic sync: re-render active page on ANY data change ──
    MedCartStore.onChange(function() {
        try { syncApprovedDrugsToPatientData(); } catch(e) {}
        renderActivePage();
    });
    PatientDataNotifier.onChange(renderActivePage);

    // On load: restore page + login state from URL hash (survive refresh)
    (function() {
        const hash = window.location.hash.replace('#','');
        if (hash === 'pg-backoffice') {
            window.location.replace('backoffice.html');
            return;
        }
        // Restore login state
        var savedWard = sessionStorage.getItem('mcWard') || currentWardName;
        if (savedWard) {
            currentWardName = savedWard;
            selectedWardName = savedWard;
            const loginWard = document.getElementById('loginWardLabel');
            if (loginWard) loginWard.textContent = savedWard;
        }
        var savedRole = sessionStorage.getItem('mcRole');
        var savedName = sessionStorage.getItem('mcName');
        var savedRoleText = sessionStorage.getItem('mcRoleText');
        if (savedRole && savedName) {
            selectRole(savedRole, savedName, savedRoleText || '');
        }
        if (hash && document.getElementById(hash)) {
            const navigated = nav(hash, true);
            history.replaceState({ page: navigated ? hash : 'pg-dashboard' }, '', '#' + (navigated ? hash : 'pg-dashboard'));
        } else {
            history.replaceState({ page: 'pg-cart' }, '', '#pg-cart');
        }
    })();

    // Initialize central data store
    try { MedCartStore.init(); } catch(e) { console.error('MedCartStore.init error:', e); }

    /* ── Keep same ward → go to Login ── */
    function keepWard() {
        const ward = currentWardName || sessionStorage.getItem('mcWard') || DEFAULT_DEMO_WARD;
        const label = document.getElementById('loginWardLabel');
        if (label) label.textContent = ward;
        try { if (wardDataReady) applyWardSelection(ward, { silent: true }); } catch(e) {}
        nav('pg-login');
    }

    /* ── Ward selection (Page 3) ── */
    const checkSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

    function pickWard(el) {
        if (el.style.pointerEvents === 'none') return;
        selectedWardName = el.dataset.name || el.querySelector('.wc-name')?.textContent || currentWardName || DEFAULT_DEMO_WARD;
        document.querySelectorAll('.wc').forEach(w => {
            w.classList.remove('chosen');
            const r = w.querySelector('.wc-radio');
            if (r) r.innerHTML = '';
        });
        el.classList.add('chosen');
        const radio = el.querySelector('.wc-radio');
        if (radio) radio.innerHTML = checkSvg;

        const btn = document.getElementById('btnSelectConfirm');
        if (btn) btn.disabled = false;

        // Update preview panel
        const name = el.querySelector('.wc-name');
        const desc = el.querySelector('.wc-desc');
        const meta = el.querySelector('.wc-meta div');
        const metaStrong = el.querySelectorAll('.wc-meta strong');
        const previewEmpty = document.getElementById('wardPreviewEmpty');
        const previewSelected = document.getElementById('wardPreviewSelected');
        if (previewEmpty) previewEmpty.style.display = 'none';
        if (previewSelected) previewSelected.style.display = '';
        const wpName = document.getElementById('wpName');
        const wpDesc = document.getElementById('wpDesc');
        const wpBeds = document.getElementById('wpBeds');
        const wpPatients = document.getElementById('wpPatients');
        if (wpName) wpName.textContent = name ? name.textContent : '—';
        if (wpDesc) wpDesc.textContent = desc ? desc.textContent : '—';
        if (wpBeds) {
            wpBeds.textContent = meta ? meta.textContent.trim().split('·')[0].trim() : (metaStrong[0] ? metaStrong[0].textContent + ' เตียง' : '—');
        }
        if (wpPatients) {
            wpPatients.textContent = meta ? (meta.textContent.trim().split('·')[1] || '').trim() : (metaStrong[1] ? metaStrong[1].textContent + ' ผู้ป่วย' : '—');
        }

        // Scroll chosen into view
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function confirmNewWard() {
        const chosenCard = document.querySelector('.wc.chosen');
        const chosen = chosenCard?.querySelector('.wc-name');
        const ward = selectedWardName || chosenCard?.dataset.name || chosen?.textContent;
        if (!ward) return;
        const label = document.getElementById('loginWardLabel');
        if (label) label.textContent = ward;
        try {
            if (wardDataReady) {
                applyWardSelection(ward);
            } else {
                currentWardName = ward;
                selectedWardName = ward;
                sessionStorage.setItem('mcWard', ward);
            }
        } catch(e) {}
        nav('pg-login');
    }

    /* ── Search / Filter ── */
    function filterWards() {
        const q = document.getElementById('wardSearch').value.trim().toLowerCase();
        const clearBtn = document.getElementById('searchClear');
        clearBtn.classList.toggle('show', q.length > 0);

        const cards = document.querySelectorAll('#wardList .wc');
        let visible = 0;

        cards.forEach(c => {
            const name  = (c.dataset.name  || '').toLowerCase();
            const desc  = (c.dataset.desc  || '').toLowerCase();
            const floor = (c.dataset.floor || '').toLowerCase();
            const match = !q || name.includes(q) || desc.includes(q) || floor.includes(q);
            c.style.display = match ? '' : 'none';
            if (match) visible++;
        });

        document.getElementById('wardEmpty').style.display = visible === 0 ? '' : 'none';

        const counter = document.getElementById('wardCount');
        if (q) {
            counter.innerHTML = 'ผลการค้นหา <strong>' + visible + '</strong> Ward';
        } else {
            counter.innerHTML = 'ทั้งหมด <strong>' + cards.length + '</strong> Ward';
        }
    }

    function clearSearch() {
        const input = document.getElementById('wardSearch');
        input.value = '';
        input.focus();
        filterWards();
    }

    /* ── Login ── */
    function switchTab(tab) {
        const segUser = document.getElementById('segUser');
        const segCard = document.getElementById('segCard');
        const panelUser = document.getElementById('panelUser');
        const panelCard = document.getElementById('panelCard');

        if (tab === 'user') {
            segUser.classList.add('active');
            segCard.classList.remove('active');
            panelUser.classList.add('active');
            panelCard.classList.remove('active');
        } else {
            segCard.classList.add('active');
            segUser.classList.remove('active');
            panelCard.classList.add('active');
            panelUser.classList.remove('active');
        }
        // Clear errors on tab switch
        document.getElementById('loginError').classList.remove('show');
        document.getElementById('cardError').classList.remove('show');
    }

    function togglePw() {
        const inp = document.getElementById('inputPw');
        const icon = document.getElementById('eyeIcon');
        if (inp.type === 'password') {
            inp.type = 'text';
            icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
        } else {
            inp.type = 'password';
            icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
    }

    function showLoginError(msg) {
        const el = document.getElementById('loginError');
        document.getElementById('loginErrorMsg').textContent = msg;
        el.classList.add('show');
    }

    function doCardLogin() {
        // Card scan → เข้าสิทธิ์หัวหน้าเวรโดยตรง
        selectRole('super','นส.ปราณี หัวหน้าเวร','หัวหน้าเวร');
    }

    function selectRole(role, name, roleText) {
        currentRole = role;
        name = name || 'คุณสมใจ';
        roleText = roleText || {nurse:'พยาบาล',pharma:'เภสัชกร',super:'หัวหน้าเวร'}[role];
        // Save login state for refresh
        sessionStorage.setItem('mcRole', role);
        sessionStorage.setItem('mcName', name);
        sessionStorage.setItem('mcRoleText', roleText);

        const ward = document.getElementById('loginWardLabel')?.textContent || currentWardName || DEFAULT_DEMO_WARD;
        currentWardName = ward;
        selectedWardName = ward;
        sessionStorage.setItem('mcWard', ward);
        try { if (wardDataReady) applyWardSelection(ward, { silent: true }); } catch(e) {}

        // Update welcome name
        const welcomeH1 = document.getElementById('dashWelcomeName');
        if (welcomeH1) welcomeH1.textContent = name;

        // Update banner gradient per role
        const banner = document.getElementById('dashBanner');
        if (banner) {
            const gradients = {
                nurse:  'linear-gradient(135deg,#0a5c55 0%,#0F766E 30%,#0D9488 65%,#0ea59a 100%)',
                pharma: 'linear-gradient(135deg,#1e3a8a 0%,#1D4ED8 30%,#3B82F6 65%,#60A5FA 100%)',
                super: 'linear-gradient(135deg,#3b0764 0%,#5B21B6 30%,#7C3AED 65%,#a855f7 100%)'
            };
            banner.style.background = gradients[role] || gradients.super;
        }

        // Update header avatar/name
        const avatarEl = document.querySelector('#pg-dashboard .hdr-avatar');
        if (avatarEl) avatarEl.textContent = name.substring(0,2).replace(/[ภญนส.]/g,'');
        const nameEl = document.querySelector('#pg-dashboard .hdr-user-name');
        if (nameEl) nameEl.textContent = name;
        const roleEl = document.querySelector('#pg-dashboard .hdr-user-role');
        if (roleEl) roleEl.textContent = roleText;

        // ── Role-based layout: CSS-driven via data-role ──
        const dashEl = document.getElementById('pg-dashboard');
        const isNurse = role === 'nurse';
        const isPharma = role === 'pharma';
        const isSuper = role === 'super';

        // Set data-role — CSS handles all section visibility & grid layout
        dashEl.setAttribute('data-role', role);

        // Remove leftover locks from prior role
        dashEl.querySelectorAll('.lock-overlay, .lock-mini').forEach(function(el){ el.remove(); });
        dashEl.querySelectorAll('[onclick]').forEach(function(c){ c.style.opacity=''; c.style.pointerEvents=''; c.style.filter=''; });

        // Clear any leftover inline display/grid styles (CSS rules take over)
        ['dashPipelineBar','dashCassettePanel','dashQuickAlerts','dashAssessQuickLink',
         'dashNurseScheduleQuickLink','dashSchedulePanel','dashActivityPanel',
         'dashTeamPanelSlot','dashBottomGrid','dashStatAssess','dashPermSection','dashRoleBottom'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) { el.style.display = ''; el.style.order = ''; el.style.gridTemplateColumns = ''; }
        });
        var prepBtn = dashEl.querySelector('.db-action[onclick*="goToPrepType"]');
        var dispenseBtn = dashEl.querySelector('.db-action[onclick*="pg-routine"]');
        if (prepBtn) prepBtn.style.display = '';
        if (dispenseBtn) dispenseBtn.style.display = '';
        var actionsGrid = dashEl.querySelector('.db-actions');
        if (actionsGrid) actionsGrid.style.gridTemplateColumns = '';
        var qlContainer = document.getElementById('dashQuickLinks');
        if (qlContainer) qlContainer.style.gridTemplateColumns = '';

        // ── Banner sub text per role ──
        var bannerSub = dashEl.querySelector('.db-banner-sub');
        if (bannerSub && typeof MedCartStore !== 'undefined' && MedCartStore.orders.length) {
            var ss = MedCartStore.getDashStats();
            if (isNurse) bannerSub.innerHTML = 'รอจ่าย <strong style="color:#a7f3d0;">' + ss.pending + ' รายการ</strong> · STAT <strong style="color:#fca5a5;">' + ss.stat + '</strong> · จ่ายแล้ว <strong style="color:#a7f3d0;">' + ss.done + '/' + ss.totalMeds + '</strong>';
            else if (isPharma) bannerSub.innerHTML = 'รอจัด <strong style="color:#a7f3d0;">' + (MedCartStore.countByStatus('scheduled')+MedCartStore.countByStatus('ordered')) + ' รายการ</strong> · จัดแล้ว <strong style="color:#a7f3d0;">' + MedCartStore.countByStatus('prepped') + '</strong> · Cassette ใช้งาน <strong style="color:#a7f3d0;">' + MedCartStore.countByStatus('prepped') + '/36</strong>';
            else bannerSub.innerHTML = 'ยา <strong style="color:#a7f3d0;">' + ss.totalMeds + ' รายการ</strong> · จ่ายแล้ว <strong style="color:#a7f3d0;">' + ss.pctDone + '%</strong> · HA <strong style="color:#fca5a5;">' + ss.highAlert + '</strong>';
        }

        // ── Stats labels per role ──
        var statDoneEl = dashEl.querySelector('#dashStatDone')?.parentElement;
        var statPendEl = dashEl.querySelector('#dashStatPending')?.parentElement;
        if (isPharma) {
            var lbl3 = statDoneEl?.querySelector('.db-stat-label'); if (lbl3) lbl3.textContent = 'จัดแล้ว';
            var lbl4 = statPendEl?.querySelector('.db-stat-label'); if (lbl4) lbl4.textContent = 'รอจัด';
        } else {
            var lbl3 = statDoneEl?.querySelector('.db-stat-label'); if (lbl3) lbl3.textContent = 'จ่ายแล้ว';
            var lbl4 = statPendEl?.querySelector('.db-stat-label'); if (lbl4) lbl4.textContent = 'รอจ่าย';
        }

        // ── eMAR label per role ──
        var emarLabel = dashEl.querySelector('#dashEmarQuickLink .db-qnav-label');
        if (emarLabel) emarLabel.textContent = isPharma ? 'ประวัติการจัดยา' : 'ประวัติการให้ยา';

        // ── Role-specific dynamic sections ──
        var sec = document.getElementById('dashRoleSection');
        if (sec) sec.innerHTML = getRoleSectionHTML(role, name, roleText);

        // Update pending verify badge count + visual alert
        if (typeof MedCartStore !== 'undefined') {
            var pvCount = MedCartStore.countPendingVerify();
            var pvBadge = document.getElementById('dashPendingVerifyCount');
            if (pvBadge) pvBadge.textContent = pvCount;
            var pvLink = document.getElementById('dashPharmaVerifyLink');
            if (pvLink && pvCount > 0 && isPharma) {
                pvLink.style.setProperty('--qn-bg', '#FEF3C7');
                pvLink.style.setProperty('--qn-border', '#F59E0B');
                pvLink.style.animation = 'pulse-border 2s ease-in-out infinite';
            } else if (pvLink) {
                pvLink.style.animation = '';
            }
        }

        // Reset prep card for pharma/super — always use goToPrepType
        if (!isNurse) {
            var prepCardReset = dashEl.querySelector('.db-action.secondary');
            if (prepCardReset) {
                prepCardReset.setAttribute('onclick', 'goToPrepType()');
                var titleReset = prepCardReset.querySelector('.db-action-title');
                if (titleReset) titleReset.textContent = 'จัดยาเข้ารถเข็น';
                var descReset = prepCardReset.querySelector('.db-action-desc');
                if (descReset) descReset.textContent = 'เตรียมยาเข้า Cassette ตามผู้ป่วย / ตามยา / ตามรอบเวลา';
                prepCardReset.style.display = '';
            }
        }

        // Nurse: hide action card จัดยา, use quick nav chip instead
        if (isNurse) {
            var prepCard = dashEl.querySelector('.db-action.secondary');
            if (prepCard) prepCard.style.display = 'none';
        }
        // Nurse prep button — always show, disable when 0 approved
        var nursePrepBtn = document.getElementById('dashNursePrepLink');
        if (nursePrepBtn && isNurse) {
            var approvedManual = (typeof MedCartStore !== 'undefined') ? MedCartStore.orders.filter(function(o){
                return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected';
            }).length : 0;
            nursePrepBtn.style.display = 'flex';
            var npBadge = document.getElementById('dashNursePrepCount');
            if (npBadge) npBadge.textContent = approvedManual;
            var npSub = document.getElementById('dashNursePrepSub');
            if (approvedManual > 0) {
                nursePrepBtn.style.opacity = '';
                nursePrepBtn.style.pointerEvents = '';
                nursePrepBtn.style.borderColor = '#86EFAC';
                nursePrepBtn.style.background = 'linear-gradient(135deg,#F0FDF4,#DCFCE7)';
                if (npSub) npSub.textContent = approvedManual + ' รายการพร้อมจัด';
            } else {
                nursePrepBtn.style.opacity = '0.5';
                nursePrepBtn.style.pointerEvents = 'none';
                nursePrepBtn.style.borderColor = '#E2E8F0';
                nursePrepBtn.style.background = '#F8FAFC';
                if (npSub) npSub.textContent = 'ยังไม่มีรายการอนุมัติ';
            }
        }
        // Show/hide the whole nurse order actions section
        var nurseActions = document.getElementById('dashNurseOrderActions');
        if (nurseActions) nurseActions.style.display = isNurse ? 'grid' : 'none';

        // Nurse: show Cassette panel only when approved orders exist (จัดยาเข้า cassette เอง)
        if (isNurse) {
            var cassettePanel = document.getElementById('dashCassettePanel');
            if (cassettePanel) {
                var hasApproved = (typeof MedCartStore !== 'undefined') && MedCartStore.orders.some(function(o){
                    return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected';
                });
                cassettePanel.style.display = hasApproved ? '' : 'none';
            }
        }

        // Super: render team panel
        var teamPanelSlot = document.getElementById('dashTeamPanelSlot');
        if (teamPanelSlot) teamPanelSlot.innerHTML = isSuper ? getRoleBottomHTML(role) : '';

        // Show user section in header
        try {
            document.body.classList.add('logged-in');
            document.getElementById('ghUserSection').style.display = 'flex';
            document.getElementById('ghUserName').textContent = name;
            document.getElementById('ghUserRole').textContent = roleText;
            document.getElementById('ghAvatar').textContent = name.substring(0,2).replace(/[ภญนส.]/g,'');
            const avatarColors = {nurse:'var(--green)',pharma:'#3b82f6',super:'#7c3aed'};
            document.getElementById('ghAvatar').style.background = 'linear-gradient(135deg,' + (avatarColors[role]||'var(--green)') + ',#5db840)';
        } catch(e) {}

        nav('pg-dashboard');
        showToast('เข้าสู่ระบบ: ' + name + ' (' + roleText + ')');
        setTimeout(() => showToast(''), 2500);
    }

    function getRoleSectionHTML(role, name, roleText) {
        const glass = 'background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);';
        let dashMetrics = { done:16, pending:8, total:24, highAlert:2, prn:3 };
        let dashCassette = {
            drawers: STANDARD_CART_DRAWERS,
            total: STANDARD_CART_CASSETTES,
            readyBase: STANDARD_CART_CASSETTES,
            perDrawer: STANDARD_CART_CASSETTES_PER_DRAWER,
            available: STANDARD_CART_CASSETTES,
            inUse: 0,
            maintenance: 0,
            completed: 0
        };
        try { dashMetrics = getDashboardMetrics(); } catch (e) {}
        try { dashCassette = getDashboardCassetteState(); } catch (e) {}
        let omitCount = 0;
        try { omitCount = ovPatients.length; } catch (e) {}
        const pharmaCassetteCards = (function() {
            let html = '';
            const drawers = Math.max(dashCassette.drawers || STANDARD_CART_DRAWERS, 1);
            const perDrawer = Math.max(dashCassette.perDrawer || STANDARD_CART_CASSETTES_PER_DRAWER, 1);
            const readyBase = Math.max(Math.min(dashCassette.readyBase || dashCassette.total || drawers * perDrawer, dashCassette.total || drawers * perDrawer), 0);
            for (let d = 1; d <= drawers; d++) {
                const drawerReady = Math.max(Math.min(readyBase - ((d - 1) * perDrawer), perDrawer), 0);
                const full = drawerReady >= perDrawer;
                const empty = drawerReady <= 0;
                const bg = full ? 'var(--green-light)' : empty ? 'var(--bg)' : '#eff6ff';
                const color = full ? 'var(--green)' : empty ? 'var(--text-3)' : '#3b82f6';
                html += '<div style="background:' + bg + ';border-radius:8px;padding:10px 6px;text-align:center;">'
                    + '<div style="font-size:14px;font-weight:700;color:' + color + ';">D' + d + '</div>'
                    + '<div style="font-size:9px;color:var(--text-2);">' + drawerReady + '/' + perDrawer + '</div>'
                    + '</div>';
            }
            return html;
        })();

        if (role === 'nurse') {
            // Build urgent list from MedCartStore (STAT + pending orders sorted by priority)
            var urgentItems = [];
            if (typeof MedCartStore !== 'undefined' && MedCartStore.orders.length) {
                var pending = MedCartStore.orders.filter(function(o){
                    return o.status !== 'dispensed' && o.status !== 'assessed' && o.status !== 'pending_verify' && o.status !== 'rejected';
                });
                // STAT first
                pending.filter(function(o){ return o.priority === 'stat'; }).forEach(function(o){
                    urgentItems.push({ name: MedCartStore.getPatientName(o.patient), bed: MedCartStore.getPatientBed(o.patient),
                        drug: o.drug, desc: 'STAT · ' + o.drug, color: '#ef4444', bg: '#fef2f2', nav: 'pg-stat' });
                });
                // High Alert
                pending.filter(function(o){ return o.highAlert && o.priority !== 'stat'; }).slice(0,2).forEach(function(o){
                    urgentItems.push({ name: MedCartStore.getPatientName(o.patient), bed: MedCartStore.getPatientBed(o.patient),
                        drug: o.drug, desc: 'High Alert · ' + o.drug + ' · ' + (o.schedule||''), color: '#d97706', bg: '#fff7ed', nav: 'pg-highalert' });
                });
                // PRN
                pending.filter(function(o){ return o.priority === 'prn'; }).slice(0,2).forEach(function(o){
                    urgentItems.push({ name: MedCartStore.getPatientName(o.patient), bed: MedCartStore.getPatientBed(o.patient),
                        drug: o.drug, desc: 'PRN · ' + o.drug, color: '#7c3aed', bg: '#f5f3ff', nav: 'pg-prn' });
                });
                // Fill remaining with routine pending
                if (urgentItems.length < 3) {
                    pending.filter(function(o){ return o.priority === 'routine' && !o.highAlert; }).slice(0, 3 - urgentItems.length).forEach(function(o){
                        urgentItems.push({ name: MedCartStore.getPatientName(o.patient), bed: MedCartStore.getPatientBed(o.patient),
                            drug: o.drug, desc: 'รอจ่าย · ' + o.drug + ' · ' + (o.schedule||''), color: '#0D9488', bg: '#f0fdf4', nav: 'pg-routine' });
                    });
                }
            }
            var urgentHtml = urgentItems.length ? urgentItems.slice(0,4).map(function(u){
                return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+u.bg+';border-radius:10px;border-left:3px solid '+u.color+';cursor:pointer;" onclick="nav(\''+u.nav+'\')">'
                    +'<div><div style="font-size:13px;font-weight:600;color:var(--text-1);">'+u.name+' · '+u.bed+'</div><div style="font-size:11px;color:'+u.color+';">'+u.desc+'</div></div>'
                    +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2" style="margin-left:auto;flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg></div>';
            }).join('') : '<div style="padding:12px;text-align:center;color:var(--text-3);font-size:12px;">ไม่มีรายการเร่งด่วน</div>';

            return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">'
                // Urgent patients
                +'<div style="'+glass+'padding:18px 20px;">'
                +'<div style="font-size:14px;font-weight:600;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:6px;">'
                +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
                +'<span>ผู้ป่วยที่ต้องจ่ายยาเร่งด่วน</span>'
                +'<span style="margin-left:auto;background:#fef2f2;color:#ef4444;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;">'+urgentItems.length+' ราย</span></div>'
                +'<div style="display:flex;flex-direction:column;gap:8px;">'+urgentHtml+'</div></div>'
                // My shift summary
                +'<div style="'+glass+'padding:18px 20px;">'
                +'<div style="font-size:14px;font-weight:600;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:6px;">'
                +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
                +'สรุปเวรของฉัน</div>'
                +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
                +'<div style="background:var(--green-light);border-radius:12px;padding:14px;text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--green);">'+dashMetrics.done+'</div><div style="font-size:10px;color:var(--text-2);margin-top:2px;">จ่ายยาแล้ว</div></div>'
                +'<div style="background:#fff7ed;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:24px;font-weight:700;color:#f59e0b;">'+dashMetrics.pending+'</div><div style="font-size:10px;color:var(--text-2);margin-top:2px;">รอจ่าย</div></div>'
                +'<div style="background:#eff6ff;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:24px;font-weight:700;color:#3b82f6;">'+omitCount+'</div><div style="font-size:10px;color:var(--text-2);margin-top:2px;">งดให้ยา</div></div>'
                +'<div style="background:#fef2f2;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:24px;font-weight:700;color:#ef4444;">0</div><div style="font-size:10px;color:var(--text-2);margin-top:2px;">ผิดพลาด</div></div>'
                +'</div></div>'
                +'</div>';
        }

        if (role === 'pharma') {
            var pvCount = (typeof MedCartStore !== 'undefined') ? MedCartStore.countPendingVerify() : 0;
            var notifHtml = '';
            if (pvCount > 0) {
                notifHtml = '<div onclick="nav(\'pg-pharma-verify\')" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);border:2px solid #F59E0B;border-radius:16px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:transform .15s;box-shadow:0 4px 16px rgba(245,158,11,0.15);" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">'
                    +'<div style="width:44px;height:44px;background:linear-gradient(135deg,#D97706,#F59E0B);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">'
                    +'<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>'
                    +'<div style="position:absolute;top:-4px;right:-4px;width:20px;height:20px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;border:2px solid #FDE68A;">'+pvCount+'</div>'
                    +'</div>'
                    +'<div style="flex:1;"><div style="font-size:15px;font-weight:800;color:#78350F;">พยาบาลขออนุมัติคำสั่งยา '+pvCount+' รายการ</div>'
                    +'<div style="font-size:11px;color:#92400E;margin-top:2px;">กดเพื่อตรวจสอบและอนุมัติ Verbal/Telephone Order</div></div>'
                    +'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2.5" style="flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>'
                    +'</div>';
            }
            // Build stock alerts from MedCartStore — drugs with highAlert or limited supply
            var stockItems = [];
            if (typeof MedCartStore !== 'undefined' && MedCartStore.orders.length) {
                var drugCounts = {};
                MedCartStore.orders.forEach(function(o) {
                    if (!drugCounts[o.drug]) drugCounts[o.drug] = { drug: o.drug, total: 0, pending: 0, ha: o.highAlert };
                    drugCounts[o.drug].total++;
                    if (o.status !== 'dispensed' && o.status !== 'assessed') drugCounts[o.drug].pending++;
                });
                Object.keys(drugCounts).forEach(function(k) {
                    var d = drugCounts[k];
                    if (d.ha || d.pending >= 3) stockItems.push(d);
                });
            }
            var stockHtml = stockItems.length ? stockItems.slice(0,4).map(function(d) {
                var critical = d.ha;
                return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+(critical?'#fef2f2':'#fff7ed')+';border-radius:10px;border-left:3px solid '+(critical?'#ef4444':'#f59e0b')+'">'
                    +'<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-1);">'+d.drug+'</div><div style="font-size:11px;color:'+(critical?'#ef4444':'#d97706')+';">'+(critical?'High Alert · ':'')+'รอจัด '+d.pending+' / ทั้งหมด '+d.total+'</div></div>'
                    +'<div style="font-size:16px;font-weight:700;color:'+(critical?'#ef4444':'#f59e0b')+';">'+d.pending+'</div></div>';
            }).join('') : '<div style="padding:12px;text-align:center;color:var(--text-3);font-size:12px;">ไม่มียาที่ต้องเตือน</div>';

            // Build prep activity from MedCartStore — recently prepped orders
            var preppedOrders = (typeof MedCartStore !== 'undefined') ? MedCartStore.orders.filter(function(o){ return o.status === 'prepped' || o.status === 'dispensed'; }).slice(0,4) : [];
            var activityHtml = preppedOrders.length ? preppedOrders.map(function(o) {
                var done = o.status === 'dispensed' || o.status === 'assessed';
                return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+(done?'#f0fdf4':'#fff7ed')+';border-radius:10px;border-left:3px solid '+(done?'#0D9488':'#f59e0b')+'">'
                    +'<div style="flex:1;"><div style="font-size:12px;font-weight:600;color:var(--text-1);">'+o.drug+' · '+MedCartStore.getPatientName(o.patient)+'</div><div style="font-size:11px;color:'+(done?'#0D9488':'#d97706')+';">'+(o.schedule||'')+' · '+(o.createdAt||'')+'</div></div>'
                    +'<div style="font-size:10px;font-weight:700;color:'+(done?'#0D9488':'#d97706')+';background:'+(done?'#dcfce7':'#fef3c7')+';padding:2px 8px;border-radius:8px;">'+(done?'จ่ายแล้ว':'จัดแล้ว')+'</div></div>';
            }).join('') : '<div style="padding:12px;text-align:center;color:var(--text-3);font-size:12px;">ยังไม่มีกิจกรรมจัดยา</div>';

            return notifHtml
                // ── Stock + Prep Activity (2 cols) ──
                +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">'
                // Stock alert
                +'<div style="'+glass+'padding:18px 20px;">'
                +'<div style="font-size:14px;font-weight:600;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:6px;">'
                +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
                +'<span>Stock ยาที่ต้องเตือน</span>'
                +'<span style="margin-left:auto;background:#fff7ed;color:#d97706;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;">'+stockItems.length+' รายการ</span></div>'
                +'<div style="display:flex;flex-direction:column;gap:8px;">'+stockHtml+'</div></div>'
                // Prep activity log
                +'<div style="'+glass+'padding:18px 20px;">'
                +'<div style="font-size:14px;font-weight:600;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:6px;">'
                +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
                +'<span>กิจกรรมจัดยาวันนี้</span>'
                +'<span style="margin-left:auto;background:#f0fdf4;color:#0D9488;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;">'+preppedOrders.length+' รายการ</span></div>'
                +'<div style="display:flex;flex-direction:column;gap:7px;">'+activityHtml+'</div></div>'
                +'</div>';
        }

        // Super — no top section (team pairs with activity in the bottom grid)
        return '';
    }

    function getRoleBottomHTML(role) {
        if (role !== 'super') return '';
        const glass = 'background:rgba(255,255,255,0.9);backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);';
        return '<div style="'+glass+'padding:20px 22px;height:100%;">'
            +'<div style="font-size:14px;font-weight:600;color:var(--text-1);margin-bottom:16px;display:flex;align-items:center;gap:8px;">'
            +'<div style="width:28px;height:28px;background:#f5f3ff;border-radius:8px;display:flex;align-items:center;justify-content:center;">'
            +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>'
            +'</div>ทีมที่ปฏิบัติงาน'
            +'<span style="margin-left:auto;font-size:10px;font-weight:600;color:#7c3aed;background:#f5f3ff;padding:2px 10px;border-radius:8px;">3 คน</span></div>'
            +'<div style="display:flex;flex-direction:column;gap:10px;">'
            +'<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f0fdf4;border-radius:12px;"><div style="width:38px;height:38px;background:linear-gradient(135deg,var(--green),#14B8A6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0;">สจ</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-1);">นส.สมใจ ดีมาก</div><div style="font-size:11px;color:#0D9488;margin-top:1px;">พยาบาล · กำลังจ่ายยา</div></div><div style="width:8px;height:8px;background:#4ade80;border-radius:50%;"></div></div>'
            +'<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#eff6ff;border-radius:12px;"><div style="width:38px;height:38px;background:linear-gradient(135deg,#3b82f6,#60a5fa);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0;">วภ</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-1);">ภญ.วิภา เจริญยา</div><div style="font-size:11px;color:#3b82f6;margin-top:1px;">เภสัชกร · กำลังจัดยา</div></div><div style="width:8px;height:8px;background:#4ade80;border-radius:50%;"></div></div>'
            +'<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f8fafc;border-radius:12px;"><div style="width:38px;height:38px;background:linear-gradient(135deg,#64748b,#94a3b8);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0;">วร</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-1);">นส.วรรณา รุ่งเรือง</div><div style="font-size:11px;color:var(--text-3);margin-top:1px;">พยาบาล · ว่าง</div></div><div style="width:8px;height:8px;background:#e2e8f0;border-radius:50%;"></div></div>'
            +'</div></div>';
    }

    /* ── Permission Modal — Role-based (Head Nurse only) ── */
    var rolePerms = {
        nurse:  { label:'พยาบาล', icon:'N', color:'#0D9488,#14B8A6', perms:{ dispense:true, highalert:true, prn:true, stat:true, prep:false, stock:false, witness:true, omit:true, overdue:true } },
        pharma: { label:'เภสัชกร', icon:'Ph', color:'#3B82F6,#60A5FA', perms:{ dispense:false, highalert:false, prn:false, stat:false, prep:true, stock:true, witness:false, omit:false, overdue:false } },
        doctor: { label:'แพทย์', icon:'Dr', color:'#D97706,#F59E0B', perms:{ dispense:false, highalert:false, prn:false, stat:false, prep:false, stock:false, witness:true, omit:false, overdue:false } },
        super:  { label:'หัวหน้าเวร', icon:'HN', color:'#7C3AED,#A78BFA', perms:{ dispense:true, highalert:true, prn:true, stat:true, prep:true, stock:true, witness:true, omit:true, overdue:true } }
    };
    var permDefs = [
        { key:'dispense',  name:'จ่ายยา Routine',      desc:'บริหารยาตามคำสั่งแพทย์ รอบปกติ', cat:'dispense' },
        { key:'stat',      name:'จ่ายยา STAT',          desc:'จ่ายยาเร่งด่วนทันที', cat:'dispense' },
        { key:'prn',       name:'จ่ายยา PRN',           desc:'จ่ายยาเมื่อมีข้อบ่งชี้ + ประเมินก่อน-หลัง', cat:'dispense' },
        { key:'highalert', name:'จ่ายยา High Alert',    desc:'ยาที่ต้องตรวจสอบเข้มงวด + Double Check', cat:'dispense' },
        { key:'overdue',   name:'จ่ายยา Overdue',       desc:'จ่ายยาที่เลยเวลากำหนด', cat:'dispense' },
        { key:'omit',      name:'งดให้ยา (Omit)',       desc:'บันทึกการงดให้ยาพร้อมเหตุผล', cat:'dispense' },
        { key:'prep',      name:'จัดยา (Preparation)',   desc:'เตรียมยาเข้ารถเข็นตาม Cassette', cat:'prep' },
        { key:'stock',     name:'ตรวจสอบ Stock',        desc:'ดู/จัดการคลังยาในรถเข็น', cat:'prep' },
        { key:'witness',   name:'เป็นพยาน (Witness)',   desc:'อนุมัติเป็นพยานยืนยันยา High Alert / STAT', cat:'other' }
    ];

    function openPermPanel() {
        renderPermModal();
        bindPermModalCloseButton();
        var modal = document.getElementById('permModal');
        if (!modal) return;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    function renderPermModal() {
        var roles = ['nurse','pharma','doctor','super'];
        var html = '';

        roles.forEach(function(rk) {
            var r = rolePerms[rk];
            var onCount = 0; var total = permDefs.length;
            permDefs.forEach(function(pd) { if (r.perms[pd.key]) onCount++; });

            html += '<div style="background:#faf8ff;border:1.5px solid #e9e5f5;border-radius:16px;margin-bottom:16px;overflow:hidden;">';
            // Role header
            html += '<div style="display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid #e9e5f5;cursor:pointer;" onclick="toggleRolePerms(\''+rk+'\')">';
            html += '<div style="width:42px;height:42px;background:linear-gradient(135deg,'+r.color+');border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;flex-shrink:0;">'+r.icon+'</div>';
            html += '<div style="flex:1;"><div style="font-size:16px;font-weight:700;color:var(--text-1);">'+r.label+'</div>';
            html += '<div style="font-size:11px;color:var(--text-3);margin-top:2px;">เปิด '+onCount+'/'+total+' สิทธิ์</div></div>';
            html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2" id="permChevron_'+rk+'" style="transition:transform .2s;"><polyline points="6 9 12 15 18 9"/></svg>';
            html += '</div>';

            // Permission toggles (collapsible)
            html += '<div id="permBody_'+rk+'" style="display:none;padding:12px 18px 16px;">';

            // Group: จ่ายยา
            html += '<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;padding-left:2px;">การจ่ายยา</div>';
            permDefs.forEach(function(pd) {
                if (pd.cat !== 'dispense') return;
                var checked = r.perms[pd.key];
                html += buildToggleRow(rk, pd, checked);
            });

            // Group: จัดยา
            html += '<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px;padding-left:2px;">การจัดยา</div>';
            permDefs.forEach(function(pd) {
                if (pd.cat !== 'prep') return;
                html += buildToggleRow(rk, pd, r.perms[pd.key]);
            });

            // Group: อื่นๆ
            html += '<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px;padding-left:2px;">อื่นๆ</div>';
            permDefs.forEach(function(pd) {
                if (pd.cat !== 'other') return;
                html += buildToggleRow(rk, pd, r.perms[pd.key]);
            });

            html += '</div></div>';
        });

        document.getElementById('permModalBody').innerHTML = html;
    }

    function buildToggleRow(rk, pd, checked) {
        var id = 'perm_'+rk+'_'+pd.key;
        var bg = checked ? 'background:#7c3aed' : 'background:#cbd5e1';
        var tx = checked ? 'transform:translateX(20px)' : 'transform:translateX(2px)';
        return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(226,232,240,0.4);">'
            +'<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-1);">'+pd.name+'</div><div style="font-size:11px;color:var(--text-3);">'+(pd.desc || pd.dose || '')+'</div></div>'
            +'<div id="'+id+'" onclick="togglePerm(\''+rk+'\',\''+pd.key+'\',this)" style="width:44px;height:24px;border-radius:12px;'+bg+';cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;">'
            +'<div style="width:20px;height:20px;background:white;border-radius:50%;position:absolute;top:2px;'+tx+';transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>'
            +'</div></div>';
    }

    function togglePerm(rk, key, el) {
        rolePerms[rk].perms[key] = !rolePerms[rk].perms[key];
        var on = rolePerms[rk].perms[key];
        el.style.background = on ? '#7c3aed' : '#cbd5e1';
        el.querySelector('div').style.transform = on ? 'translateX(20px)' : 'translateX(2px)';
        // Update counter in header
        var onCount = 0;
        permDefs.forEach(function(pd) { if (rolePerms[rk].perms[pd.key]) onCount++; });
        var headerSub = el.closest('[style*="border-radius:16px"]').querySelector('[style*="color:var(--text-3)"]');
        if (headerSub && headerSub.textContent.indexOf('เปิด') !== -1) headerSub.textContent = 'เปิด '+onCount+'/'+permDefs.length+' สิทธิ์';
    }

    function toggleRolePerms(rk) {
        var body = document.getElementById('permBody_'+rk);
        var chev = document.getElementById('permChevron_'+rk);
        if (body.style.display === 'none') {
            body.style.display = '';
            chev.style.transform = 'rotate(180deg)';
        } else {
            body.style.display = 'none';
            chev.style.transform = '';
        }
    }

    function closePermModal() {
        var modal = document.getElementById('permModal');
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        if (modal.contains(document.activeElement)) document.activeElement.blur();
    }

    function bindPermModalCloseButton() {
        var closeBtn = document.getElementById('permCloseBtn');
        if (!closeBtn || closeBtn.dataset.bound === '1') return;
        closeBtn.dataset.bound = '1';
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closePermModal();
        });
    }

    function savePermModal() {
        closePermModal();
        showToast('บันทึกสิทธิ์ทั้งหมดสำเร็จ');
        setTimeout(function(){ showToast(''); }, 2000);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        var modal = document.getElementById('permModal');
        if (modal && modal.style.display !== 'none') closePermModal();
    });

    function startCardScan(mode) {
        const box = document.getElementById('cardScanBox');
        const btn = document.getElementById('csScanBtn');

        // Hide all states
        document.getElementById('csIdle').style.display = 'none';
        document.getElementById('csScanning').style.display = 'none';
        document.getElementById('csSuccess').style.display = 'none';
        document.getElementById('csError').style.display = 'none';

        // Show scanning
        document.getElementById('csScanning').style.display = '';
        box.style.borderColor = 'rgba(255,255,255,0.5)';
        btn.disabled = true;
        btn.style.opacity = '.5';

        setTimeout(() => {
            document.getElementById('csScanning').style.display = 'none';

            if (mode === 'fail') {
                // Error state
                document.getElementById('csError').style.display = '';
                box.style.borderColor = 'rgba(239,68,68,0.5)';
                btn.disabled = false;
                btn.style.opacity = '1';

                // Auto-reset after 3s
                setTimeout(() => { resetCardScan(); }, 3000);
            } else {
                // Success state
                document.getElementById('csSuccess').style.display = '';
                box.style.borderColor = 'rgba(255,255,255,0.7)';
                box.style.background = 'rgba(255,255,255,0.2)';

                // Navigate to dashboard after showing success
                setTimeout(() => {
                    doCardLogin();
                    // Reset for next time
                    setTimeout(() => { resetCardScan(); }, 500);
                }, 1800);
            }
        }, 1500);
    }

    function resetCardScan() {
        document.getElementById('csIdle').style.display = '';
        document.getElementById('csScanning').style.display = 'none';
        document.getElementById('csSuccess').style.display = 'none';
        document.getElementById('csError').style.display = 'none';
        const box = document.getElementById('cardScanBox');
        box.style.borderColor = 'rgba(255,255,255,0.2)';
        box.style.background = 'rgba(255,255,255,0.12)';
        const btn = document.getElementById('csScanBtn');
        btn.disabled = false;
        btn.style.opacity = '1';
    }

    function doLogin() {
        const user = document.getElementById('inputUser').value.trim();
        const pw   = document.getElementById('inputPw').value;
        const errEl = document.getElementById('loginError');

        // Clear previous error
        errEl.classList.remove('show');
        document.getElementById('inputUser').classList.remove('error');
        document.getElementById('inputPw').classList.remove('error');

        if (!user || !pw) {
            if (!user) document.getElementById('inputUser').classList.add('error');
            if (!pw)   document.getElementById('inputPw').classList.add('error');
            showLoginError('กรุณากรอก Username และ Password ให้ครบ');
            return;
        }

        // Demo accounts: 3 roles
        const accounts = {
            'admin':   { pw:'1234', role:'nurse',  name:'นส.สมใจ ดีมาก',    roleText:'พยาบาล' },
            'admin_2': { pw:'1234', role:'pharma', name:'ภญ.วิภา เจริญยา',   roleText:'เภสัชกร' },
            'admin_3': { pw:'1234', role:'super',  name:'นส.ปราณี หัวหน้าเวร', roleText:'หัวหน้าเวร' }
        };

        const acct = accounts[user];
        if (acct && pw === acct.pw) {
            selectRole(acct.role, acct.name, acct.roleText);
        } else {
            document.getElementById('inputUser').classList.add('error');
            document.getElementById('inputPw').classList.add('error');
            showLoginError('Username หรือ Password ไม่ถูกต้อง');
        }
    }

    // Allow Enter key to submit login
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.getElementById('pg-login').classList.contains('active')) {
            const panel = document.getElementById('panelUser');
            if (panel.classList.contains('active')) doLogin();
        }
    });

    /* ── Prep type selection (Page 6) ── */
    let selectedPrepType = null;

    var nurseApprovedOnlyMode = false;

    function goToNursePrepApproved() {
        nav('pg-nurse-prep');
    }

    function renderNursePrepPage() {
        var wl = document.getElementById('npWardLabel'); if (wl) wl.textContent = currentWardName || 'Ward 3A';
        var cl = document.getElementById('npCartLabel'); if (cl) cl.textContent = 'Med Cart A-1';

        var approved = (typeof MedCartStore !== 'undefined') ? MedCartStore.orders.filter(function(o){
            return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected';
        }) : [];

        // Group by patient
        var byPatient = {};
        approved.forEach(function(o) {
            if (!byPatient[o.patient]) byPatient[o.patient] = [];
            byPatient[o.patient].push(o);
        });
        var ptKeys = Object.keys(byPatient);

        // Check which drugs have been prepped already
        var preppedIds = {};
        approved.forEach(function(o) {
            if (o.status === 'prepped' || o.status === 'dispensed' || o.status === 'assessed') preppedIds[o.id] = true;
            // Also check patientData
            if (typeof patientData !== 'undefined' && patientData[o.patient]) {
                (patientData[o.patient].drugs || []).forEach(function(d) {
                    if (d.manualOrderId === o.id && (d.done || d.prepared)) preppedIds[o.id] = true;
                });
            }
        });
        var doneCount = Object.keys(preppedIds).length;
        var pendingCount = approved.length - doneCount;

        // Stats
        var te = document.getElementById('npTotalCount'); if (te) te.textContent = approved.length;
        var pe = document.getElementById('npPatientCount'); if (pe) pe.textContent = ptKeys.length;
        var de = document.getElementById('npDoneCount'); if (de) de.textContent = doneCount;
        var pde = document.getElementById('npPendingCount'); if (pde) pde.textContent = pendingCount;

        // Mode card stats
        var drugNames = {};
        var schedules = {};
        approved.forEach(function(o) {
            drugNames[o.drug] = true;
            if (o.schedule) schedules[o.schedule] = true;
        });
        var sp = document.getElementById('npStatPatient'); if (sp) sp.textContent = ptKeys.length + ' ผู้ป่วย · ' + approved.length + ' รายการ';
        var sm = document.getElementById('npStatMed'); if (sm) sm.textContent = Object.keys(drugNames).length + ' ชนิดยา · ' + approved.length + ' รายการ';
        var ss = document.getElementById('npStatSched'); if (ss) ss.textContent = Object.keys(schedules).length + ' รอบ · ' + approved.length + ' รายการ';

        // Drug list
        var list = document.getElementById('npDrugList');
        if (!list) return;
        if (!approved.length) {
            list.innerHTML = '<div class="op-empty">ยังไม่มีรายการที่เภสัชอนุมัติ</div>';
            return;
        }

        list.innerHTML = ptKeys.map(function(key) {
            var pt = (typeof patientData !== 'undefined' && patientData[key]) ? patientData[key] : {};
            var ptName = (typeof MedCartStore !== 'undefined' && MedCartStore.getPatientName) ? MedCartStore.getPatientName(key) : (pt.name || key);
            var ptBed = (typeof MedCartStore !== 'undefined' && MedCartStore.getPatientBed) ? MedCartStore.getPatientBed(key) : (pt.bed || '');
            var drugs = byPatient[key];
            var shortName = ptName.replace(/^(นาย|นางสาว|นาง|นส\.)\s*/, '');

            var header = '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--bg);border-radius:10px;margin:8px 0 6px;">'
                + '<div style="width:36px;height:36px;background:linear-gradient(135deg,#059669,#10B981);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0;">' + escHtml(shortName.slice(0,2)) + '</div>'
                + '<div style="flex:1;"><div style="font-size:14px;font-weight:700;color:var(--text-1);">' + escHtml(ptName) + '</div>'
                + '<div style="font-size:11px;color:var(--text-3);">เตียง ' + escHtml(ptBed) + ' · ' + drugs.length + ' รายการ</div></div></div>';

            var rows = drugs.map(function(o) {
                var isDone = !!preppedIds[o.id];
                var borderColor = isDone ? '#10B981' : '#D97706';
                var statusTag = isDone
                    ? '<span style="background:#DCFCE7;color:#059669;font-size:10px;font-weight:700;padding:4px 10px;border-radius:8px;">จัดแล้ว</span>'
                    : '<span style="background:#FEF3C7;color:#92400E;font-size:10px;font-weight:700;padding:4px 10px;border-radius:8px;">รอจัด</span>';
                var priTag = o.priority === 'stat' ? '<span class="op-tag stat">STAT</span>'
                    : o.priority === 'high-alert' ? '<span class="op-tag ha">High Alert</span>'
                    : o.priority === 'prn' ? '<span class="op-tag prn">PRN</span>' : '';

                return '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border);border-left:3px solid ' + borderColor + ';">'
                    + '<div style="flex:1;min-width:0;">'
                    + '<div style="font-size:14px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:6px;">' + escHtml(o.drug) + ' ' + priTag + '</div>'
                    + '<div style="font-size:12px;color:var(--text-2);margin-top:3px;">' + escHtml(o.dose||'') + ' · ' + escHtml(o.route||'') + ' · ' + escHtml(o.schedule||'') + '</div>'
                    + '<div style="font-size:11px;color:var(--text-3);margin-top:2px;">แพทย์: ' + escHtml(o.doctor||'-') + ' · ' + escHtml(o.orderSource||'Verbal order') + '</div>'
                    + '</div>'
                    + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">' + statusTag + '</div>'
                    + '</div>';
            }).join('');

            return header + rows;
        }).join('');
    }

    function npStartPrep(orderId, patientKey) {
        currentLegacyDispenseBed = patientKey;
        nurseApprovedOnlyMode = true;
        try { syncApprovedDrugsToPatientData(); } catch(e) {}
        var ward = currentWardName || DEFAULT_DEMO_WARD;
        try {
            document.getElementById('prepWardHeader').textContent = ward;
            document.getElementById('prepWardCtx').textContent = ward;
        } catch(e) {}
        goToPrepFlow('patient');
    }

    function npGoPrep(mode) {
        nurseApprovedOnlyMode = true;
        try { syncApprovedDrugsToPatientData(); } catch(e) {}
        var ward = currentWardName || DEFAULT_DEMO_WARD;
        try {
            document.getElementById('prepWardHeader').textContent = ward;
            document.getElementById('prepWardCtx').textContent = ward;
        } catch(e) {}
        goToPrepFlow(mode);
    }

    function goToPrepType() {
        nurseApprovedOnlyMode = false; // full prep mode (pharma/super)
        const ward = currentWardName || document.getElementById('ghWard')?.textContent || DEFAULT_DEMO_WARD;
        document.getElementById('prepWardHeader').textContent = ward;
        document.getElementById('prepWardCtx').textContent = ward;
        renderPrepTypePage();
        nav('pg-prep-type');
    }

    function goToPrepFlow(type) {
        selectedPrepType = type;
        // Ensure approved drugs are synced before rendering
        if (nurseApprovedOnlyMode) { try { syncApprovedDrugsToPatientData(); } catch(e) {} }
        const labels = { patient: 'จัดยาตามผู้ป่วย', medication: 'จัดยาตามรายการยา', schedule: 'จัดยาตามรอบเวลา' };
        const ward = document.getElementById('prepWardCtx')?.textContent || currentWardName || DEFAULT_DEMO_WARD;

        if (type === 'patient') {
            document.getElementById('pbpWard').textContent = ward;
            renderPrepPatientPage();
            nav('pg-prep-patient');
        } else if (type === 'medication') {
            document.getElementById('pbmWard').textContent = ward;
            renderPrepMedicationPage();
            nav('pg-prep-med');
        } else {
            // schedule
            document.getElementById('pbsWard').textContent = ward;
            renderPrepSchedulePage();
            nav('pg-prep-sched');
        }
        showToast('เลือก: ' + labels[type]);
        setTimeout(() => showToast(''), 1500);
    }

    /* ── Prep Patient Drugs: Drawer → Cassette flow ── */
    let ptDrugDrawerDone = false;
    let ptDrugCassDone = false;

    function ptDrugDrawerDoneUI(label, method) {
        ptDrugDrawerDone = true;
        const step1 = document.getElementById('ptDrugStep1');
        step1.style.border = '2px solid var(--green)';
        step1.style.background = 'rgba(240,253,250,0.9)';
        document.getElementById('ptDrugDrawerStatus').textContent = label;
        document.getElementById('ptDrugDrawerStatus').style.color = 'var(--green)';
        document.getElementById('ptDrugDrawerStatus').style.fontWeight = '600';
        // Replace buttons with done badge
        document.getElementById('ptDrugDrawerBtns').innerHTML = '<div style="background:var(--green);color:white;border-radius:10px;padding:10px 16px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> D1 ' + method + '</div>';
        // Enable Step 2
        const step2 = document.getElementById('ptDrugStep2');
        step2.style.opacity = '1';
        step2.style.pointerEvents = '';
        step2.style.border = '2px solid #F59E0B';
        step2.style.background = 'rgba(255,255,255,0.9)';
        document.getElementById('ptDrugStep2Badge').style.background = 'linear-gradient(135deg,#D97706,#F59E0B)';
        document.getElementById('ptDrugCassStatus').textContent = 'กรุณาสแกน Cassette เพื่อยืนยันช่อง';
        document.getElementById('ptDrugScanIcon').style.background = '#FFFBEB';
        document.getElementById('ptDrugScanIcon').style.borderColor = '#FDE68A';
        document.getElementById('ptDrugScanIcon').innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>';
        const btn2 = document.getElementById('ptDrugScanBtn');
        btn2.disabled = false;
        btn2.style.background = 'linear-gradient(135deg,#D97706,#F59E0B)';
        btn2.style.boxShadow = '0 4px 12px rgba(217,119,6,0.25)';

        showToast(method === 'เลือกแล้ว' ? 'เลือก Drawer 1 สำเร็จ' : 'สแกน Drawer 1 สำเร็จ');
        setTimeout(() => showToast(''), 1500);
    }

    function ptDrugSelectDrawer() {
        ptDrugDrawerDoneUI('เลือกด้วยตนเอง: Drawer 1 — D1', 'เลือกแล้ว');
    }

    function ptDrugScanDrawer() {
        ptDrugDrawerDoneUI('สแกนบาร์โค้ด: Drawer 1 — D1', 'สแกนแล้ว');
    }

    function ptDrugScanCassette() {
        ptDrugCassDone = true;
        // Update Step 2 to done
        const step2 = document.getElementById('ptDrugStep2');
        step2.style.border = '2px solid var(--green)';
        step2.style.background = 'rgba(240,253,250,0.9)';
        document.getElementById('ptDrugStep2Badge').style.background = 'var(--green)';
        document.getElementById('ptDrugCassStatus').textContent = 'สแกนสำเร็จ: Cassette A-01 — Slot A-01';
        document.getElementById('ptDrugCassStatus').style.color = 'var(--green)';
        document.getElementById('ptDrugCassStatus').style.fontWeight = '600';
        document.getElementById('ptDrugScanIcon').style.background = 'var(--green-light)';
        document.getElementById('ptDrugScanIcon').style.borderColor = 'var(--green-mid)';
        document.getElementById('ptDrugScanIcon').innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        const btn2 = document.getElementById('ptDrugScanBtn');
        btn2.style.background = 'var(--green)';
        btn2.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> A-01 สแกนแล้ว';

        // Enable start button
        const startBtn = document.getElementById('ptDrugStartBtn');
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';

        showToast('สแกน Cassette A-01 สำเร็จ — พร้อมจัดยา');
        setTimeout(() => showToast(''), 2000);
    }

    function filterPbp() {
        const q = document.getElementById('pbpSearch').value.trim().toLowerCase();
        document.querySelectorAll('#pbpList > div[data-name]').forEach(c => {
            const name = (c.dataset.name || '').toLowerCase();
            const hn = (c.dataset.hn || '').toLowerCase();
            const bed = (c.dataset.bed || '').toLowerCase();
            c.style.display = (!q || name.includes(q) || hn.includes(q) || bed.includes(q)) ? '' : 'none';
        });
    }

    function syncApprovedDrugsToPatientData() {
        if (typeof MedCartStore === 'undefined' || typeof patientData === 'undefined') return;
        var scheduleMap = {'รอบเช้า':'OD เช้า','รอบเที่ยง':'OD เที่ยง','รอบเย็น':'OD เย็น','ก่อนนอน':'OD ก่อนนอน','STAT now':'STAT','PRN':'PRN'};
        MedCartStore.orders.forEach(function(o) {
            if (o.source !== 'Manual' || o.status === 'pending_verify' || o.status === 'rejected') return;
            if (!o.patient || !patientData[o.patient]) return;
            var pt = patientData[o.patient];
            pt.drugs = pt.drugs || [];
            var exists = pt.drugs.some(function(d){ return d.manualOrderId === o.id; });
            if (!exists) {
                pt.drugs.push({
                    name: o.drug, dose: o.dose || o.drug, route: o.route || 'PO',
                    freq: scheduleMap[o.schedule] || o.schedule || '', schedule: o.schedule || '', time: o.time || '',
                    color: o.priority === 'stat' ? '#EF4444' : o.priority === 'high-alert' ? '#D97706' : '#7C3AED',
                    highAlert: o.priority === 'high-alert', manualOrderId: o.id, source: 'Manual', doctor: o.doctor || ''
                });
            }
        });
    }

    function getApprovedManualDrugIds() {
        if (!nurseApprovedOnlyMode || typeof MedCartStore === 'undefined') return null;
        var approved = MedCartStore.orders.filter(function(o){
            return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected';
        });
        return approved.map(function(o){ return o.id; });
    }

    function filterDrugsIfApprovedMode(drugs) {
        var ids = getApprovedManualDrugIds();
        if (!ids) return drugs;
        return drugs.filter(function(d) {
            return d.manualOrderId && ids.indexOf(d.manualOrderId) >= 0;
        });
    }

    function prepPatientRows() {
        return getDispensePatientKeys().map(function(key) {
            const pt = patientData[key];
            var drugs = (pt && pt.drugs) || [];
            drugs = filterDrugsIfApprovedMode(drugs);
            const pending = drugs.filter(function(d) { return !d.done; }).length;
            const highAlert = drugs.some(function(d) { return d.highAlert || isHighAlertDrug(d.name); });
            return { key: key, pt: pt, drugs: drugs, pending: pending, highAlert: highAlert };
        }).filter(function(row) { return !!row.pt && row.drugs.length > 0; }).sort(function(a, b) {
            const bedA = String((a.pt && a.pt.bed) || a.key || '');
            const bedB = String((b.pt && b.pt.bed) || b.key || '');
            return bedA.localeCompare(bedB, 'th', { numeric: true, sensitivity: 'base' });
        });
    }

    function prepMedRows() {
        const byName = {};
        getDispensePatientKeys().forEach(function(key) {
            const pt = patientData[key];
            if (!pt) return;
            var allDrugs = filterDrugsIfApprovedMode(pt.drugs || []);
            allDrugs.forEach(function(drug, idx) {
                const view = legacyDrugView(drug, pt, idx);
                const name = view.name;
                const norm = normalizeIbfDrugName(name);
                const qty = parseIbfQty(view.dose);
                if (!byName[norm]) {
                    const fallback = getIbfStaticDrugData(name) || {};
                    byName[norm] = {
                        name: name,
                        code: fallback.code || ('DRG-' + String(Object.keys(byName).length + 1).padStart(4, '0')),
                        form: fallback.form || 'ตามใบสั่งยา',
                        route: view.routeShort || fallback.route || 'PO',
                        color: drug.color || '#2563EB',
                        colorLight: drug.colorLight || ['#EFF6FF','#DBEAFE'],
                        patients: new Set(),
                        totalQty: 0,
                        totalItems: 0,
                        doneItems: 0,
                        highAlert: false,
                        interactionSeverity: null,
                        interactionCount: 0,
                        interactionPairs: new Set()
                    };
                }
                const row = byName[norm];
                row.patients.add(key);
                row.totalQty += Number(qty.qty) || 1;
                row.totalItems += 1;
                row.doneItems += view.done ? 1 : 0;
                row.highAlert = row.highAlert || view.highAlert;
                const otherNames = (pt.drugs || []).filter(function(_, otherIdx) {
                    return otherIdx !== idx;
                }).map(function(otherDrug) {
                    return otherDrug.name;
                });
                const interactionProfile = getDrugInteractionProfile(view.name, otherNames);
                if (interactionProfile.found) {
                    row.interactionCount += interactionProfile.matches.length;
                    interactionProfile.matches.forEach(function(match) {
                        row.interactionPairs.add(match.drug2);
                    });
                    if (!row.interactionSeverity || getInteractionSeverityRank(interactionProfile.severity) > getInteractionSeverityRank(row.interactionSeverity)) {
                        row.interactionSeverity = interactionProfile.severity;
                    }
                }
            });
        });
        return Object.values(byName).sort(function(a, b) {
            const aOpen = a.totalItems - a.doneItems;
            const bOpen = b.totalItems - b.doneItems;
            if (bOpen !== aOpen) return bOpen - aOpen;
            return a.name.localeCompare(b.name);
        });
    }

    function prepSummary() {
        const patients = prepPatientRows();
        const medRows = prepMedRows();
        const totalDrugs = patients.reduce(function(sum, row) { return sum + row.drugs.length; }, 0);
        const pendingDrugs = patients.reduce(function(sum, row) { return sum + row.pending; }, 0);
        const doneDrugs = totalDrugs - pendingDrugs;
        const donePatients = patients.filter(function(row) { return row.drugs.length > 0 && row.pending === 0; }).length;
        return { patients: patients, medRows: medRows, totalDrugs: totalDrugs, pendingDrugs: pendingDrugs, doneDrugs: doneDrugs, donePatients: donePatients };
    }

    function prepSetStatNumbers(pageId, values) {
        const page = document.getElementById(pageId);
        if (!page) return;
        const cards = page.querySelectorAll('[style*="grid-template-columns:repeat"][style*="margin-bottom"] > div');
        values.forEach(function(value, idx) {
            const num = cards[idx] ? cards[idx].querySelector('div[style*="font-size:30px"], div[style*="font-size:28px"], div[style*="font-size:26px"]') : null;
            if (num) num.innerHTML = value;
        });
    }

    function renderPrepPatientPage() {
        const summary = prepSummary();
        const rows = summary.patients;
        const ward = currentWardName || DEFAULT_DEMO_WARD;
        setAllTextById('pbpWard', ward);
        const page = document.getElementById('pg-prep-patient');
        if (!page) return;

        const subtitles = page.querySelectorAll('p');
        if (subtitles[0]) subtitles[0].innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> แผนผังเตียง · ' + escHtml(ward);
        prepSetStatNumbers('pg-prep-patient', [
            rows.length,
            rows.length,
            summary.pendingDrugs,
            summary.donePatients
        ]);

        const floor = document.getElementById('pbpFloorPlan');
        if (floor) {
            const maxBeds = Math.max(rows.length, 8);
            let bedHtml = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">'
                + '<div style="width:34px;height:34px;background:linear-gradient(135deg,#e0f2fe,#bae6fd);border-radius:10px;display:flex;align-items:center;justify-content:center;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></div>'
                + '<div style="font-size:15px;font-weight:700;color:var(--text-1);">แผนผังห้อง</div>'
                + '<div style="margin-left:auto;font-size:10px;color:var(--text-3);font-weight:500;">' + escHtml(ward) + '</div>'
                + '</div>'
                + '<div style="display:flex;gap:16px;margin-bottom:18px;padding:9px 14px;background:rgba(248,250,252,0.8);backdrop-filter:blur(8px);border-radius:10px;border:1px solid rgba(226,232,240,0.5);font-size:11px;color:var(--text-2);font-weight:500;">'
                + '<span style="display:flex;align-items:center;gap:5px;"><div style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#0D9488,#14B8A6);"></div> รอจัด</span>'
                + '<span style="display:flex;align-items:center;gap:5px;"><div style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#22c55e);"></div> จัดครบ</span>'
                + '<span style="display:flex;align-items:center;gap:5px;"><div style="width:10px;height:10px;border-radius:50%;background:#d1d5db;"></div> ว่าง</span>'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">';
            for (let i = 0; i < maxBeds; i++) {
                const row = rows[i];
                if (!row) {
                    bedHtml += '<div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:14px;padding:14px 10px;"><div style="font-size:22px;font-weight:700;color:#c0c5cc;">' + String(i + 1).padStart(2, '0') + '</div><div style="font-size:10.5px;color:#b0b5bd;margin-top:4px;font-weight:500;">ว่าง</div></div>';
                    continue;
                }
                const done = row.drugs.length > 0 && row.pending === 0;
                const bedNum = String(row.pt.bed || row.key).split('-').pop();
                const bg = done ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' : 'linear-gradient(135deg,#e0f2fe,#bae6fd)';
                const color = done ? '#16a34a' : '#0284c7';
                const status = done ? 'จัดครบ' : row.pending + '/' + row.drugs.length + ' รอจัด';
                bedHtml += '<div onclick="goToPatientDrugs(\'' + escHtml(row.key) + '\')" style="background:' + bg + ';border:1px solid rgba(186,230,253,0.65);border-radius:14px;padding:14px 10px;cursor:pointer;transition:all .2s ease;position:relative;overflow:hidden;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(56,189,248,0.2)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">'
                    + '<div style="font-size:22px;font-weight:700;color:' + color + ';">' + escHtml(bedNum) + '</div>'
                    + '<div style="font-size:10.5px;color:#0369a1;margin-top:4px;font-weight:500;">' + escHtml(row.pt.name.replace(/^(นาย|นาง|นส\.)\s*/,'')) + '</div>'
                    + '<div style="margin-top:6px;"><span style="background:' + (done ? '#16a34a' : 'linear-gradient(135deg,#0284c7,#0ea5e9)') + ';color:white;padding:3px 8px;border-radius:6px;font-size:8.5px;font-weight:600;display:inline-flex;align-items:center;gap:3px;">' + escHtml(status) + '</span></div>'
                    + (row.highAlert ? '<div style="position:absolute;top:7px;right:7px;background:#dc2626;color:white;font-size:8px;font-weight:800;padding:2px 5px;border-radius:5px;">HA</div>' : '<div style="position:absolute;top:7px;right:7px;width:8px;height:8px;border-radius:50%;background:' + (done ? '#16a34a' : '#0D9488') + ';box-shadow:0 0 0 2px rgba(13,148,136,0.2);"></div>')
                    + '</div>';
            }
            floor.innerHTML = bedHtml + '</div>';
        }

        const list = document.getElementById('pbpList');
        if (list) {
            list.innerHTML = rows.map(function(row) {
                const done = row.drugs.length > 0 && row.pending === 0;
                const bedNum = String(row.pt.bed || row.key).split('-').pop();
                const doneCount = row.drugs.length - row.pending;
                const progress = row.drugs.length ? Math.round((doneCount / row.drugs.length) * 100) : 0;
                const pendingDrugs = row.drugs.filter(function(d) { return !d.done; });
                const previewDrugs = (pendingDrugs.length ? pendingDrugs : row.drugs).slice(0, 2);
                const extraDrugCount = Math.max((pendingDrugs.length ? pendingDrugs.length : row.drugs.length) - previewDrugs.length, 0);
                const cardClass = 'pbp-patient-card' + (done ? ' done' : '') + (row.highAlert ? ' high-alert' : '');
                const statusClass = done ? 'pbp-card-status done' : 'pbp-card-status';
                const tags = [];
                if (row.highAlert) tags.push('<span class="pbp-card-tag ha">High Alert</span>');
                if (row.pt.allergy) tags.push('<span class="pbp-card-tag allergy">' + escHtml(row.pt.allergy.replace(/^แพ้ยา:\s*/, 'แพ้ ')) + '</span>');
                (row.pt.tags || []).slice(0, 2).forEach(function(tag) {
                    tags.push('<span class="pbp-card-tag">' + escHtml(tag) + '</span>');
                });
                const drugHtml = previewDrugs.map(function(drug) {
                    const parsed = parseDrugDesc(drug.desc);
                    return '<span class="pbp-card-drug">' + escHtml(drug.name) + ' · ' + escHtml(parsed.dose) + '</span>';
                }).join('') + (extraDrugCount ? '<span class="pbp-card-drug more">+' + extraDrugCount + ' รายการ</span>' : '');
                return '<div class="' + cardClass + '" onclick="goToPatientDrugs(\'' + escHtml(row.key) + '\')" data-name="' + escHtml(row.pt.name) + '" data-hn="' + escHtml(row.pt.hn) + '" data-bed="' + escHtml(row.pt.bed) + '">'
                    + '<div class="pbp-card-top">'
                    + '<div class="pbp-bed-chip"><strong>' + escHtml(bedNum) + '</strong><span>BED</span></div>'
                    + '<div class="pbp-card-main">'
                    + '<div class="pbp-card-name-row"><div class="pbp-card-name">' + escHtml(row.pt.name) + '</div><div class="' + statusClass + '">' + (done ? 'จัดครบแล้ว' : 'รอจัด ' + row.pending + ' รายการ') + '</div></div>'
                    + '<div class="pbp-card-meta"><span>HN: ' + escHtml(row.pt.hn) + '</span><span>เตียง ' + escHtml(row.pt.bed) + '</span><span>' + escHtml(row.pt.round || 'รอบยา') + '</span></div>'
                    + (tags.length ? '<div class="pbp-card-tags">' + tags.join('') + '</div>' : '')
                    + '<div class="pbp-card-progress-row"><div class="pbp-card-progress"><span style="width:' + progress + '%"></span></div><div class="pbp-card-count">' + doneCount + '/' + row.drugs.length + ' รายการ</div></div>'
                    + (drugHtml ? '<div class="pbp-card-drugs">' + drugHtml + '</div>' : '')
                    + '</div>'
                    + '</div>'
                    + '</div>';
            }).join('');
            const countPill = document.getElementById('pbpPatientCountPill') || list.closest('[style*="display:flex"]')?.querySelector('[style*="padding:4px 10px"]');
            if (countPill) countPill.textContent = rows.length + ' คน';
        }
        filterPbp();
    }

    function renderPrepMedicationPage() {
        const summary = prepSummary();
        const rows = summary.medRows;
        const ward = currentWardName || DEFAULT_DEMO_WARD;
        setAllTextById('pbmWard', ward);
        const page = document.getElementById('pg-prep-med');
        if (!page) return;

        const subtitle = page.querySelector('h1 + p');
        if (subtitle) subtitle.textContent = 'จัดยาตามรายการยา · ' + ward;
        prepSetStatNumbers('pg-prep-med', [
            rows.length,
            summary.totalDrugs,
            summary.patients.length,
            summary.doneDrugs + '<span style="font-size:14px;opacity:.6;">/' + summary.totalDrugs + '</span>'
        ]);

        const list = document.getElementById('pbmList');
        if (!list) return;
        const palette = ['#3B82F6','#0D9488','#8B5CF6','#EF4444','#F59E0B','#EC4899','#06B6D4','#16A34A'];
        const interactionTotal = rows.filter(function(row) { return !!row.interactionSeverity; }).length;
        const filterBtns = page.querySelectorAll('.filter-btn');
        if (filterBtns[3]) filterBtns[3].textContent = 'Interaction' + (interactionTotal ? ' (' + interactionTotal + ')' : '');
        list.innerHTML = rows.map(function(row, idx) {
            const pending = Math.max(0, row.totalItems - row.doneItems);
            const done = pending === 0;
            const partial = row.doneItems > 0 && pending > 0;
            const color = row.color || palette[idx % palette.length];
            const progress = Math.min(100, Math.max(0, Math.round((row.doneItems / Math.max(row.totalItems, 1)) * 100)));
            const statusKey = done ? 'done' : partial ? 'partial' : 'pending';
            const statusText = done ? 'จัดครบแล้ว' : partial ? 'กำลังจัด' : 'รอจัด';
            const click = done ? '' : 'onclick="ibfDrugName=\'' + escHtml(row.name) + '\';ibfPopulateMedDetail();nav(\'pg-prep-med-detail\')"';
            const highAlert = row.highAlert ? '<span class="pbm-high-alert">High Alert</span>' : '';
            const interaction = prepInteractionBadge(row);
            const footerCopy = done ? 'จัดครบแล้ว' : 'เลือกเพื่อกำหนด Drawer / Cassette';
            const cardClass = 'pbm-card' + (done ? ' is-done' : '');
            return '<div class="' + cardClass + '" ' + click + ' data-name="' + escHtml(row.name) + '" data-code="' + escHtml(row.code) + '" data-status="' + statusKey + '" data-interaction="' + (row.interactionSeverity ? 'true' : 'false') + '" data-severity="' + escHtml(row.interactionSeverity || '') + '" style="--drug-color:' + color + ';">'
                + '<div class="pbm-card-top">'
                + '<div class="pbm-drug-lead">'
                + '<div class="pbm-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 21h4"/><path d="M12 3v18"/><path d="M7 7h10"/><path d="M8 7l1 11h6l1-11"/></svg></div>'
                + '<div class="pbm-info">'
                + '<div class="pbm-name">' + escHtml(row.name) + highAlert + interaction + '</div>'
                + '<div class="pbm-meta"><span>' + escHtml(row.code) + '</span><span>' + escHtml(row.form) + '</span><span>' + escHtml(row.route) + '</span></div>'
                + '</div>'
                + '</div>'
                + '<span class="pbm-status ' + statusKey + '">' + statusText + '</span>'
                + '</div>'
                + '<div class="pbm-kpi-row">'
                + '<div class="pbm-kpi primary"><div class="pbm-kpi-num">' + row.totalQty + '</div><div class="pbm-kpi-label">จำนวนรวม</div></div>'
                + '<div class="pbm-kpi"><div class="pbm-kpi-num">' + row.patients.size + '</div><div class="pbm-kpi-label">ผู้ป่วย</div></div>'
                + '<div class="pbm-kpi"><div class="pbm-kpi-num">' + pending + '</div><div class="pbm-kpi-label">รอจัด</div></div>'
                + '</div>'
                + '<div class="pbm-progress-wrap">'
                + '<div class="pbm-progress-copy"><span>ความคืบหน้า</span><strong>' + row.doneItems + '/' + row.totalItems + ' รายการ</strong></div>'
                + '<div class="pbm-progress-track"><div class="pbm-progress-bar" style="width:' + progress + '%;"></div></div>'
                + '</div>'
                + '<div class="pbm-card-footer">'
                + '<span>' + escHtml(ward) + '</span>'
                + '<span class="pbm-card-cta">' + footerCopy + (done ? '' : '<svg class="pbm-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>') + '</span>'
                + '</div>'
                + '</div>';
        }).join('');
        filterPbm();
    }

    let currentPrepRound = 'รอบเช้า';

    function prepRoundFromView(view, pt) {
        const source = ((view && view.freq) || (pt && pt.round) || '').toLowerCase();
        if ((view && view.time) === 'PRN' || source.includes('prn')) return 'PRN';
        if (source.includes('ก่อนนอน') || (view && view.time) === '21:00') return 'ก่อนนอน';
        if (source.includes('เย็น') || (view && view.time) === '18:00') return 'รอบเย็น';
        if (source.includes('เที่ยง') || (view && view.time) === '12:00') return 'รอบเที่ยง';
        return 'รอบเช้า';
    }

    function prepScheduleRows(roundName, includeDone) {
        const rows = [];
        getDispensePatientKeys().forEach(function(key) {
            const pt = patientData[key];
            if (!pt) return;
            var allDrugs = filterDrugsIfApprovedMode(pt.drugs || []);
            allDrugs.forEach(function(drug, idx) {
                const view = legacyDrugView(drug, pt, idx);
                const round = prepRoundFromView(view, pt);
                if (roundName && round !== roundName) return;
                if (!includeDone && view.done) return;
                rows.push({
                    key: key,
                    pt: pt,
                    drug: drug,
                    idx: idx,
                    view: view,
                    round: round,
                    qty: parseIbfQty(view.dose)
                });
            });
        });
        return rows;
    }

    function renderPharmaVerifyPage() {
        var wl = document.getElementById('pvWardLabel'); if (wl) wl.textContent = currentWardName || 'Ward 3A';
        var cl = document.getElementById('pvCartLabel'); if (cl) cl.textContent = 'Med Cart A-1';

        var pending = MedCartStore.orders.filter(function(o){ return o.status === 'pending_verify'; });
        var approved = MedCartStore.orders.filter(function(o){ return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected'; });
        var rejected = MedCartStore.orders.filter(function(o){ return o.status === 'rejected'; });

        // Stats
        var pe = document.getElementById('pvPendingCount'); if (pe) pe.textContent = pending.length;
        var ae = document.getElementById('pvApprovedCount'); if (ae) ae.textContent = approved.length;
        var re = document.getElementById('pvRejectedCount'); if (re) re.textContent = rejected.length;
        var te = document.getElementById('pvTotalCount'); if (te) te.textContent = pending.length + approved.length + rejected.length;
        var pb = document.getElementById('pvPendingBadge'); if (pb) pb.textContent = pending.length + ' รายการ';

        // Pending list
        var pl = document.getElementById('pvPendingList');
        if (pl) {
            if (pending.length === 0) {
                pl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">ไม่มีรายการรออนุมัติ</div>';
            } else {
                pl.innerHTML = pending.map(function(o) {
                    var ptName = MedCartStore.getPatientName ? MedCartStore.getPatientName(o.patient) : o.patient;
                    var priBadge = o.priority === 'stat' ? '<span style="background:#FEF2F2;color:#DC2626;font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;border:1px solid #FECACA;">STAT</span>'
                        : o.priority === 'high-alert' ? '<span style="background:#FEF2F2;color:#DC2626;font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;border:1px solid #FECACA;">High Alert</span>'
                        : o.priority === 'prn' ? '<span style="background:#F5F3FF;color:#7C3AED;font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;border:1px solid #DDD6FE;">PRN</span>'
                        : '';
                    return '<div style="display:flex;align-items:center;gap:14px;padding:16px;border-bottom:1px solid var(--border);flex-wrap:wrap;">'
                        +'<div style="flex:1;min-width:200px;">'
                        +'<div style="font-size:14px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:6px;">' + o.drug + ' ' + priBadge + '</div>'
                        +'<div style="font-size:12px;color:var(--text-2);margin-top:3px;">' + ptName + ' · ' + (o.dose||'') + ' · ' + (o.route||'') + ' · ' + (o.schedule||'') + '</div>'
                        +'<div style="font-size:11px;color:var(--text-3);margin-top:2px;">แพทย์: ' + (o.doctor||'-') + ' · ' + (o.orderSource||o.source||'Manual') + ' · ' + (o.createdAt||'') + '</div>'
                        + (o.note ? '<div style="font-size:11px;color:#6D28D9;margin-top:2px;">หมายเหตุ: ' + o.note + '</div>' : '')
                        +'</div>'
                        +'<div style="display:flex;gap:8px;flex-shrink:0;">'
                        +'<button type="button" onclick="pvApprove(\''+o.id+'\')" style="padding:8px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#059669,#10B981);color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:Prompt,sans-serif;">อนุมัติ</button>'
                        +'<button type="button" onclick="pvReject(\''+o.id+'\')" style="padding:8px 18px;border-radius:10px;border:1.5px solid #FECACA;background:#FEF2F2;color:#DC2626;font-size:12px;font-weight:700;cursor:pointer;font-family:Prompt,sans-serif;">ปฏิเสธ</button>'
                        +'</div></div>';
                }).join('');
            }
        }

        // History list
        var hl = document.getElementById('pvHistoryList');
        if (hl) {
            var history = approved.concat(rejected).sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
            if (history.length === 0) {
                hl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-3);font-size:13px;">ยังไม่มีประวัติ</div>';
            } else {
                hl.innerHTML = history.map(function(o) {
                    var ptName = MedCartStore.getPatientName ? MedCartStore.getPatientName(o.patient) : o.patient;
                    var isRejected = o.status === 'rejected';
                    var statusBadge = isRejected
                        ? '<span style="background:#FEF2F2;color:#DC2626;font-size:10px;font-weight:700;padding:3px 10px;border-radius:8px;border:1px solid #FECACA;">ปฏิเสธ</span>'
                        : '<span style="background:#F0FDF4;color:#059669;font-size:10px;font-weight:700;padding:3px 10px;border-radius:8px;border:1px solid #BBF7D0;">อนุมัติแล้ว</span>';
                    return '<div style="display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid var(--border);opacity:' + (isRejected ? '0.6' : '1') + ';">'
                        +'<div style="flex:1;min-width:0;">'
                        +'<div style="font-size:13px;font-weight:600;color:var(--text-1);">' + o.drug + '</div>'
                        +'<div style="font-size:11px;color:var(--text-2);margin-top:2px;">' + ptName + ' · ' + (o.dose||'') + ' · ' + (o.route||'') + '</div>'
                        + (isRejected && o.rejectReason ? '<div style="font-size:11px;color:#DC2626;margin-top:2px;">เหตุผล: ' + o.rejectReason + '</div>' : '')
                        +'</div>'
                        + statusBadge
                        +'</div>';
                }).join('');
            }
        }
    }

    function pvApprove(orderId) {
        MedCartStore.approveOrder(orderId);
        renderPharmaVerifyPage();
        showToast('อนุมัติคำสั่งยาแล้ว — เข้า pipeline จัดยา');
        setTimeout(function(){ showToast(''); }, 2500);
    }

    function pvReject(orderId) {
        var reason = prompt('เหตุผลที่ปฏิเสธ:');
        if (reason === null) return;
        MedCartStore.rejectOrder(orderId, null, reason);
        renderPharmaVerifyPage();
        showToast('ปฏิเสธคำสั่งยาแล้ว');
        setTimeout(function(){ showToast(''); }, 2500);
    }

    function opSwitchTab(tab, btn) {
        var verbal = document.getElementById('opTabVerbal');
        var offcart = document.getElementById('opTabOffcart');
        var banner = document.getElementById('opPendingBanner');
        if (verbal) verbal.style.display = tab === 'verbal' ? '' : 'none';
        if (offcart) offcart.style.display = tab === 'offcart' ? '' : 'none';
        if (banner) banner.style.display = tab === 'verbal' && banner.innerHTML ? '' : 'none';
        // Update active tab styling
        var vBtn = document.getElementById('opTabBtnVerbal');
        var oBtn = document.getElementById('opTabBtnOffcart');
        if (vBtn) { vBtn.style.borderColor = tab === 'verbal' ? '#DDD6FE' : '#E2E8F0'; vBtn.style.background = tab === 'verbal' ? 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' : '#F8FAFC'; }
        if (oBtn) { oBtn.style.borderColor = tab === 'offcart' ? '#FDE68A' : '#E2E8F0'; oBtn.style.background = tab === 'offcart' ? 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' : '#F8FAFC'; }
        if (tab === 'offcart') renderOffcartTab();
    }

    function renderOffcartTab() {
        // Populate patient select
        var ps = document.getElementById('emarOffPatient');
        if (ps && typeof orderPlanPatientOptionsHtml === 'function') {
            var prev = ps.value;
            ps.innerHTML = orderPlanPatientOptionsHtml(prev);
            if (prev) ps.value = prev;
        }
        // Stats
        var offcarts = (typeof MedCartStore !== 'undefined') ? MedCartStore.offcart : [];
        var todayEl = document.getElementById('ocTodayCount'); if (todayEl) todayEl.textContent = offcarts.length;
        var wsCount = offcarts.filter(function(r){ return r.source === 'Ward stock'; }).length;
        var emCount = offcarts.filter(function(r){ return r.source === 'Emergency kit'; }).length;
        var otCount = offcarts.length - wsCount - emCount;
        var wsEl = document.getElementById('ocWardStockCount'); if (wsEl) wsEl.textContent = wsCount;
        var emEl = document.getElementById('ocEmergencyCount'); if (emEl) emEl.textContent = emCount;
        var otEl = document.getElementById('ocOtherCount'); if (otEl) otEl.textContent = otCount;
        // Log
        var logBadge = document.getElementById('ocLogBadge');
        var logList = document.getElementById('ocLogList');
        if (logList && typeof getWardEmarRecords === 'function' && typeof emarLogRowHtml === 'function') {
            var records = getWardEmarRecords(currentWardName || 'Ward 3A').filter(function(r){ return r.offCart; });
            logList.innerHTML = records.length ? records.map(emarLogRowHtml).join('') : '<div class="op-empty">ยังไม่มีบันทึก Off-cart วันนี้</div>';
            if (logBadge) logBadge.textContent = records.length + ' records';
        }
    }

    function renderPharmaReportPage() {
        var storeData = (typeof MedCartStore !== 'undefined' && MedCartStore.orders.length > 0) ? MedCartStore : null;
        var holdCount = 0, offcartCount = 0, cassetteRemain = 0;
        var cassetteItems = [];
        if (storeData) {
            storeData.orders.forEach(function(o) { if (o.status === 'prepped') cassetteItems.push(o); });
            cassetteRemain = cassetteItems.length;
            holdCount = typeof ovPatients !== 'undefined' ? ovPatients.length : 0;
            offcartCount = storeData.offcart.length;
        }
        var reportRow = function(icon, iconBg, title, detail, borderColor) {
            return '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:white;border-radius:12px;border-left:3px solid '+borderColor+';box-shadow:0 1px 3px rgba(0,0,0,0.04);">'
                +'<div style="width:36px;height:36px;background:'+iconBg+';border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+icon+'</div>'
                +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text-1);">'+title+'</div><div style="font-size:11px;color:var(--text-2);margin-top:2px;">'+detail+'</div></div>'
                +'</div>';
        };
        var el = document.getElementById('pharmaReportContent');
        if (!el) return;
        // Ward/cart labels
        var wl = document.getElementById('prptWardLabel'); if (wl) wl.textContent = currentWardName || 'Ward 3A';
        var cl = document.getElementById('prptCartLabel'); if (cl) cl.textContent = 'Med Cart A-1';

        el.innerHTML = ''
            // Stats row
            +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">'
            +'<div style="background:#FEF2F2;border-radius:14px;padding:18px;text-align:center;border:1px solid #FECACA;"><div style="font-size:28px;font-weight:800;color:#DC2626;">'+cassetteRemain+'</div><div style="font-size:11px;color:#991B1B;font-weight:700;margin-top:4px;">ค้าง Cassette</div></div>'
            +'<div style="background:#FFFBEB;border-radius:14px;padding:18px;text-align:center;border:1px solid #FDE68A;"><div style="font-size:28px;font-weight:800;color:#D97706;">'+holdCount+'</div><div style="font-size:11px;color:#92400E;font-weight:700;margin-top:4px;">Hold / Omit</div></div>'
            +'<div style="background:#FFF7ED;border-radius:14px;padding:18px;text-align:center;border:1px solid #FED7AA;"><div style="font-size:28px;font-weight:800;color:#EA580C;">'+offcartCount+'</div><div style="font-size:11px;color:#9A3412;font-weight:700;margin-top:4px;">Off-cart</div></div>'
            +'<div style="background:#FEF2F2;border-radius:14px;padding:18px;text-align:center;border:1px solid #FECACA;"><div style="font-size:28px;font-weight:800;color:#DC2626;">0</div><div style="font-size:11px;color:#991B1B;font-weight:700;margin-top:4px;">7 Rights Fail</div></div>'
            +'</div>'
            // Detail list
            +'<div style="display:flex;flex-direction:column;gap:10px;">'
            + (cassetteItems.length > 0 ? cassetteItems.map(function(o) {
                return reportRow(
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>',
                    '#FEF2F2', 'ค้าง Cassette — ' + o.drug,
                    MedCartStore.getPatientName(o.patient) + ' · จัดแล้วแต่ยังไม่จ่าย · ' + (o.schedule||'') + ' ' + (o.time||''),
                    '#DC2626'
                );
            }).join('') : reportRow(
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
                '#F0FDF4', 'ไม่มียาค้างใน Cassette', 'ยาที่จัดแล้วถูกจ่ายครบ', '#10B981'
            ))
            + reportRow(
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
                '#FFFBEB', 'Hold / Omit — ' + holdCount + ' รายการ',
                holdCount > 0 ? 'ยาที่ถูกงดให้ ต้องตรวจสอบว่าต้องคืน stock หรือทำลาย' : 'ไม่มียาที่ถูก hold หรืองด',
                '#D97706'
            )
            + reportRow(
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
                '#FFF7ED', 'Off-cart — ' + offcartCount + ' รายการ',
                offcartCount > 0 ? 'ยาที่ให้นอก Med Cart ต้องตรวจ stock reconciliation' : 'ไม่มีการให้ยานอกรถเข็นวันนี้',
                '#EA580C'
            )
            + reportRow(
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
                '#FEF2F2', '7 Rights Fail — 0 รายการ',
                'ยาที่สแกนแล้วไม่ผ่านการตรวจ 7 Rights ต้องตรวจสอบ root cause',
                '#DC2626'
            )
            +'</div>';
    }

    function renderPrepTypePage() {
        const summary = prepSummary();
        const rounds = ['รอบเช้า','รอบเที่ยง','รอบเย็น','ก่อนนอน'].filter(function(round) {
            return prepScheduleRows(round, true).length > 0;
        });

        // Nurse approved-only banner
        var prepBanner = document.getElementById('prepApprovedBanner');
        if (!prepBanner) {
            var topbar = document.querySelector('#pg-prep-type .op-topbar');
            if (topbar) {
                prepBanner = document.createElement('div');
                prepBanner.id = 'prepApprovedBanner';
                topbar.parentNode.insertBefore(prepBanner, topbar.nextSibling);
            }
        }
        if (prepBanner) {
            if (nurseApprovedOnlyMode && currentRole === 'nurse') {
                var approvedDrugs = (typeof MedCartStore !== 'undefined') ? MedCartStore.orders.filter(function(o){
                    return o.source === 'Manual' && o.status !== 'pending_verify' && o.status !== 'rejected';
                }) : [];
                var drugList = approvedDrugs.map(function(o){
                    return '<span style="background:#DCFCE7;color:#065F46;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;border:1px solid #BBF7D0;">' + escHtml(o.drug) + ' · ' + escHtml(MedCartStore.getPatientName(o.patient)) + '</span>';
                }).join(' ');
                prepBanner.innerHTML = '<div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px solid #86EFAC;border-radius:14px;padding:14px 20px;margin-bottom:16px;">'
                    + '<div style="font-size:14px;font-weight:800;color:#065F46;margin-bottom:6px;">จัดเฉพาะยาที่เภสัชอนุมัติแล้ว · ' + approvedDrugs.length + ' รายการ</div>'
                    + '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + drugList + '</div>'
                    + '</div>';
            } else {
                prepBanner.innerHTML = '';
            }
        }

        const nums = document.querySelectorAll('#pg-prep-type .ptc-stat-num');
        if (nums[0]) nums[0].textContent = summary.patients.length;
        if (nums[1]) nums[1].textContent = summary.totalDrugs;
        if (nums[2]) nums[2].textContent = summary.medRows.length;
        if (nums[3]) nums[3].textContent = summary.totalDrugs;
        if (nums[4]) nums[4].textContent = Math.max(rounds.length, 1);
        if (nums[5]) nums[5].textContent = summary.totalDrugs;

    }

    function scheduleCardHtml(round, cfg, rows) {
        const patients = new Set(rows.map(function(row) { return row.key; }));
        const done = rows.filter(function(row) { return row.view.done; }).length;
        const total = rows.length;
        const statusText = total === 0 ? 'ไม่มีรายการ' : done === total ? 'จัดครบแล้ว' : done > 0 ? 'จัดแล้วบางส่วน' : 'ยังไม่จัด';
        const statusColor = total === 0 ? '#6B7280' : done === total ? '#16A34A' : done > 0 ? '#2563EB' : '#6B7280';
        return '<div onclick="openPrepScheduleDetail(\'' + escHtml(round) + '\')" style="background:rgba(255,255,255,0.88);backdrop-filter:blur(14px);border:1.5px solid var(--border);border-radius:18px;overflow:hidden;cursor:pointer;transition:all .3s ease;box-shadow:0 2px 12px rgba(0,0,0,0.04);" onmouseover="this.style.transform=\'translateY(-4px)\';this.style.boxShadow=\'0 12px 36px ' + cfg.shadow + '\';this.style.borderColor=\'' + cfg.border + '\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 12px rgba(0,0,0,0.04)\';this.style.borderColor=\'var(--border)\'">'
            + '<div style="background:' + cfg.gradient + ';padding:20px 20px 16px;position:relative;overflow:hidden;"><div style="position:absolute;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.1);top:-25px;right:-15px;"></div><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;background:rgba(255,255,255,0.22);backdrop-filter:blur(8px);border-radius:13px;display:flex;align-items:center;justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div style="font-size:17px;font-weight:700;color:white;">' + escHtml(round) + '</div><div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:1px;">' + escHtml(cfg.time) + '</div></div></div></div>'
            + '<div style="padding:16px 20px 18px;"><div style="display:flex;gap:10px;margin-bottom:14px;"><div style="flex:1;background:' + cfg.soft + ';border-radius:10px;padding:10px 8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:' + cfg.color + ';">' + patients.size + '</div><div style="font-size:10px;color:var(--text-3);margin-top:1px;">ผู้ป่วย</div></div><div style="flex:1;background:' + cfg.soft + ';border-radius:10px;padding:10px 8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:' + cfg.color + ';">' + total + '</div><div style="font-size:10px;color:var(--text-3);margin-top:1px;">รายการยา</div></div></div><div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;background:var(--bg);border-radius:20px;width:fit-content;margin:0 auto;"><span style="width:7px;height:7px;background:' + statusColor + ';border-radius:50%;display:inline-block;"></span><span style="font-size:11px;font-weight:600;color:' + statusColor + ';">' + statusText + '</span></div></div>'
            + '</div>';
    }

    function renderPrepSchedulePage() {
        const page = document.getElementById('pg-prep-sched');
        if (!page) return;
        const ward = currentWardName || DEFAULT_DEMO_WARD;
        setAllTextById('pbsWard', ward);
        const subtitle = page.querySelector('h1 + p');
        if (subtitle) subtitle.textContent = 'เลือกรอบเวลาสำหรับจัดยา · ' + ward;
        const allRows = prepScheduleRows(null, true);
        const done = allRows.filter(function(row) { return row.view.done; }).length;
        prepSetStatNumbers('pg-prep-sched', [
            new Set(allRows.map(function(row) { return row.key; })).size,
            allRows.length,
            done + '<span style="font-size:16px;opacity:.7;font-weight:600;">/' + allRows.length + '</span>'
        ]);
        const grid = page.querySelector('div[style*="max-width:800px"]');
        if (!grid) return;
        const configs = {
            'รอบเช้า': { time:'06:00 – 08:00 น.', gradient:'linear-gradient(135deg,#F59E0B,#FBBF24)', color:'#D97706', soft:'#FFFBEB', border:'#FCD34D', shadow:'rgba(245,158,11,0.18)' },
            'รอบเที่ยง': { time:'11:00 – 12:00 น.', gradient:'linear-gradient(135deg,#EF4444,#F87171)', color:'#DC2626', soft:'#FEF2F2', border:'#FCA5A5', shadow:'rgba(239,68,68,0.15)' },
            'รอบเย็น': { time:'16:00 – 18:00 น.', gradient:'linear-gradient(135deg,#F97316,#FB923C)', color:'#EA580C', soft:'#FFF7ED', border:'#FDBA74', shadow:'rgba(249,115,22,0.15)' },
            'ก่อนนอน': { time:'20:00 – 22:00 น.', gradient:'linear-gradient(135deg,#6366F1,#818CF8)', color:'#4F46E5', soft:'#EEF2FF', border:'#A5B4FC', shadow:'rgba(99,102,241,0.18)' }
        };
        grid.innerHTML = Object.keys(configs).map(function(round) {
            return scheduleCardHtml(round, configs[round], prepScheduleRows(round, true));
        }).join('');
    }

    function openPrepScheduleDetail(round) {
        currentPrepRound = round || 'รอบเช้า';
        renderPrepScheduleDetail();
        nav('pg-sched-detail');
    }

    function renderPrepScheduleDetail() {
        const page = document.getElementById('pg-sched-detail');
        if (!page) return;
        const rows = prepScheduleRows(currentPrepRound, false);
        const allRows = prepScheduleRows(currentPrepRound, true);
        const ward = currentWardName || DEFAULT_DEMO_WARD;
        const patients = new Set(allRows.map(function(row) { return row.key; }));
        const done = allRows.filter(function(row) { return row.view.done; }).length;
        const title = page.querySelector('.ptd-name');
        if (title) title.innerHTML = escHtml(currentPrepRound) + ' ' + schedBasedBadge();
        const meta = page.querySelectorAll('.ptd-meta-item');
        if (meta[0]) meta[0].textContent = currentPrepRound === 'รอบเที่ยง' ? '11:00 – 12:00 น.' : currentPrepRound === 'รอบเย็น' ? '16:00 – 18:00 น.' : currentPrepRound === 'ก่อนนอน' ? '20:00 – 22:00 น.' : '06:00 – 08:00 น.';
        if (meta[1]) meta[1].textContent = ward;
        if (meta[2]) meta[2].textContent = rows.length ? 'รอจัด ' + rows.length + ' รายการ' : 'จัดครบแล้ว';
        const stats = page.querySelectorAll('.ptd-patient-card [style*="text-align:center"] > div:first-child');
        if (stats[0]) stats[0].textContent = patients.size;
        if (stats[1]) stats[1].textContent = allRows.length;
        if (stats[2]) stats[2].textContent = done;
        const queueHead = page.querySelector('.ptd-drugs-title span');
        if (queueHead) queueHead.textContent = 'Work Queue (' + rows.length + ')';
        const roundBadge = page.querySelector('.ptd-round-badge');
        if (roundBadge) roundBadge.textContent = currentPrepRound;
        const preview = page.querySelector('.ptd-drugs-scroll');
        if (preview) {
            preview.innerHTML = rows.slice(0, 8).map(function(row) {
                return '<div style="background:rgba(255,255,255,0.72);border:1px solid rgba(124,58,237,0.12);border-left:3px solid ' + (row.drug.color || '#7C3AED') + ';border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
                    + '<div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:5px;">' + escHtml(row.view.name) + haBadge(row.view.name) + '</div><div style="font-size:10px;color:var(--text-3);">' + escHtml(row.pt.name.replace(/^(นาย|นาง|นส\.)\s*/,'')) + ' · ' + escHtml(row.pt.bed) + ' · ' + escHtml(row.view.dose) + '</div></div>'
                    + '<span style="padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;background:#FEF3C7;color:#92400E;">รอจัด</span>'
                    + '</div>';
            }).join('') || '<div style="padding:18px;text-align:center;color:var(--text-3);font-size:12px;">ไม่มีรายการรอจัดในรอบนี้</div>';
        }
        const startBtn = page.querySelector('.ptd-actions .btn-primary');
        if (startBtn) {
            startBtn.onclick = function() {
                ptdCommitCassetteLock('schedule', buildScheduleCassetteLockMeta());
                trfPopulate();
                nav('pg-trf');
            };
        }
    }

    function trfPopulate() {
        const rows = prepScheduleRows(currentPrepRound, false);
        trfDrugNames.length = 0;
        trfDestNames.length = 0;
        trfQtys.length = 0;
        trfTargetRefs = [];
        rows.forEach(function(row, idx) {
            trfDrugNames.push(row.view.name);
            trfDestNames.push(row.pt.name + ' · ' + row.pt.bed);
            trfQtys.push(row.view.dose);
            trfTargetRefs.push({ key: row.key, drugIdx: row.idx, hn: row.pt.hn, bed: row.pt.bed, name: row.view.name, slot: ibfSlotLabel(idx) });
        });
        trfActiveIdx = 0;
        trfDoneCount = 0;
        trfScannedSet.clear();
        const total = trfDrugNames.length;
        const topName = document.querySelector('#pg-trf .pf-topbar-name');
        const topMeta = document.querySelector('#pg-trf .pf-topbar-meta');
        if (topName) topName.innerHTML = escHtml(currentPrepRound + ' · ' + (currentPrepRound === 'รอบเที่ยง' ? '11:00–12:00 น.' : currentPrepRound === 'รอบเย็น' ? '16:00–18:00 น.' : currentPrepRound === 'ก่อนนอน' ? '20:00–22:00 น.' : '06:00–08:00 น.')) + ' ' + schedBasedBadge();
        if (topMeta) topMeta.textContent = currentWardName || DEFAULT_DEMO_WARD;
        const totalEl = document.querySelector('#pg-trf .trf-ts-num.total');
        if (totalEl) totalEl.textContent = total;
        const doneEl = document.getElementById('trfDone');
        const leftEl = document.getElementById('trfLeft');
        if (doneEl) doneEl.textContent = '0';
        if (leftEl) leftEl.textContent = total;
        const head = document.querySelector('#pg-trf .trf-queue-head');
        if (head) head.textContent = 'Work Queue (' + total + ')';
        const queue = document.getElementById('trfQueue');
        if (queue) {
            queue.innerHTML = rows.map(function(row, i) {
                return '<div class="pf-drug-item' + (i === 0 ? ' active' : '') + '" onclick="trfSelect(this,' + i + ')"><div class="pf-drug-check" style="' + (i === 0 ? 'border-color:#7C3AED;background:rgba(124,58,237,0.08);' : '') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="' + (i === 0 ? '#7C3AED' : 'white') + '" stroke-width="3" style="opacity:0;"><path d="M20 6L9 17l-5-5"/></svg></div><div style="flex:1;"><div class="pf-drug-name" style="display:flex;align-items:center;gap:5px;">' + escHtml(row.view.name) + haBadge(row.view.name) + '</div><div class="pf-drug-sub">' + escHtml(row.pt.name) + ' · ' + escHtml(row.pt.bed) + ' · ' + ibfSlotLabel(i) + '</div></div><div class="pf-drug-qty" style="color:#7C3AED;">' + escHtml(row.view.dose) + '</div></div>';
            }).join('') || '<div style="padding:18px;text-align:center;color:var(--text-3);font-size:12px;">ไม่มีรายการรอจัดในรอบนี้</div>';
        }
        const scanResult = document.getElementById('trfScanResult');
        if (scanResult) scanResult.style.display = 'none';
        const confirmBtn = document.getElementById('trfBtnConfirm');
        const summaryBtn = document.getElementById('trfBtnSummary');
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = '0.4'; confirmBtn.style.cursor = 'not-allowed'; }
        if (summaryBtn) { summaryBtn.disabled = true; summaryBtn.style.opacity = '0.4'; summaryBtn.style.cursor = 'not-allowed'; }
    }

    /* ── Patient data for pg-prep-pt-drugs ── */
    const patientData = {
        '01': {
            avatar: 'สช', name: 'นายสมชาย มานะ', hn: '6401234', bed: '3A-01',
            age: 'ชาย, 58 ปี', allergy: 'แพ้ยา: Penicillin, Sulfonamides', round: 'รอบเช้า',
            tags: ['Drug Allergy'],
            drugs: [
                { name: 'Amlodipine 5 mg',     desc: '1 เม็ด · PO · OD เช้า',       color: '#3B82F6', colorLight: ['#EFF6FF','#DBEAFE'], status: 'รอจัด', done: false },
                { name: 'Metformin 500 mg',     desc: '1 เม็ด · PO · BID หลังอาหาร', color: '#0D9488', colorLight: ['#F0FDFA','#CCFBF1'], status: 'รอจัด', done: false },
                { name: 'Omeprazole 20 mg',     desc: '1 แคปซูล · PO · OD ก่อนอาหาร', color: '#8B5CF6', colorLight: ['#F5F3FF','#EDE9FE'], status: 'รอจัด', done: false },
                { name: 'Heparin 5000u',        desc: '1 vial · SC · OD เช้า',       color: '#EF4444', colorLight: ['#FEF2F2','#FEE2E2'], status: 'รอจัด', done: false, highAlert: true },
                { name: 'Simvastatin 20 mg',    desc: '1 เม็ด · PO · OD ก่อนนอน',   color: '#8B5CF6', colorLight: ['#F5F3FF','#EDE9FE'], status: 'รอจัด', done: false },
                { name: 'Morphine 2.5 mg',      desc: '1 amp · IV · PRN ปวดรุนแรง (VAS≥7)', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, highAlert: true, indication: 'ปวดรุนแรง VAS ≥ 7', interval: 4 },
                { name: 'Metoclopramide 10 mg', desc: '1 เม็ด · PO · PRN คลื่นไส้/อาเจียน', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'คลื่นไส้/อาเจียน', interval: 6 }
            ]
        },
        '02': {
            avatar: 'พจ', name: 'นส.พิมพ์ใจ สุขสม', hn: '6401567', bed: '3A-02',
            age: 'หญิง, 45 ปี', allergy: 'แพ้ยา: Aspirin', round: 'รอบเช้า',
            tags: ['Drug Allergy'],
            drugs: [
                { name: 'Losartan 50 mg',       desc: '1 เม็ด · PO · OD เช้า',     color: '#3B82F6', colorLight: ['#EFF6FF','#DBEAFE'], status: 'ยังไม่จัด', done: false },
                { name: 'Simvastatin 20 mg',    desc: '1 เม็ด · PO · OD ก่อนนอน', color: '#8B5CF6', colorLight: ['#F5F3FF','#EDE9FE'], status: 'จัดแล้ว ✓', done: true },
                { name: 'Paracetamol 500 mg',   desc: '2 เม็ด · PO · PRN ปวด/ไข้ (ห้ามใช้ NSAIDs)', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 }
            ]
        },
        '03': {
            avatar: 'มล', name: 'นางมาลี สุขใจ', hn: '6404215', bed: '3A-03',
            age: 'หญิง, 67 ปี', allergy: '', round: 'รอบเช้า',
            tags: ['Fall Risk'],
            drugs: [
                { name: 'Amlodipine 10 mg',     desc: '1 เม็ด · PO · OD เช้า',  color: '#3B82F6', colorLight: ['#EFF6FF','#DBEAFE'], status: 'ยังไม่จัด', done: false },
                { name: 'Metformin 500 mg',     desc: '1 เม็ด · PO · BID',       color: '#0D9488', colorLight: ['#F0FDFA','#CCFBF1'], status: 'ยังไม่จัด', done: false },
                { name: 'Enalapril 5 mg',       desc: '1 เม็ด · PO · OD เช้า',  color: '#F59E0B', colorLight: ['#FFFBEB','#FEF3C7'], status: 'ยังไม่จัด', done: false },
                { name: 'Furosemide 40 mg',     desc: '1 เม็ด · PO · OD เช้า',  color: '#0D9488', colorLight: ['#F0FDFA','#CCFBF1'], status: 'ยังไม่จัด', done: false },
                { name: 'Paracetamol 500 mg',   desc: '2 เม็ด · PO · PRN ปวด/ไข้', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 },
                { name: 'Lorazepam 0.5 mg',     desc: '1 เม็ด · PO · PRN นอนไม่หลับ', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'นอนไม่หลับ', interval: 24 }
            ]
        },
        '05': {
            avatar: 'วช', name: 'นายวิชัย ดีงาม', hn: '6402890', bed: '3A-05',
            age: 'ชาย, 72 ปี', allergy: 'แพ้ยา: NSAIDs', round: 'รอบเช้า',
            tags: ['Fall Risk', 'Drug Allergy'],
            drugs: [
                { name: 'Warfarin 3 mg',        desc: '1 เม็ด · PO · OD ก่อนนอน', color: '#EF4444', colorLight: ['#FEF2F2','#FEE2E2'], status: 'ยังไม่จัด', done: false, highAlert: true },
                { name: 'Omeprazole 20 mg',     desc: '1 แคปซูล · PO · OD เช้า',  color: '#8B5CF6', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false },
                { name: 'Paracetamol 500 mg',   desc: '2 เม็ด · PO · PRN ปวด/ไข้ (ห้ามใช้ NSAIDs)', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 }
            ]
        },
        '08': {
            avatar: 'กย', name: 'นางกัลยา ชัยวงศ์', hn: '6403012', bed: '3A-08',
            age: 'หญิง, 54 ปี', allergy: '', round: 'รอบเช้า',
            tags: [],
            drugs: [
                { name: 'Metformin 500 mg',     desc: '1 เม็ด · PO · BID',          color: '#0D9488', colorLight: ['#F0FDFA','#CCFBF1'], status: 'ยังไม่จัด', done: false },
                { name: 'Glipizide 5 mg',       desc: '1 เม็ด · PO · OD เช้า',      color: '#3B82F6', colorLight: ['#EFF6FF','#DBEAFE'], status: 'ยังไม่จัด', done: false },
                { name: 'Atorvastatin 20 mg',   desc: '1 เม็ด · PO · OD ก่อนนอน',  color: '#8B5CF6', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false },
                { name: 'Ceftriaxone 1 g',      desc: '1 vial · IV · OD เช้า',      color: '#EF4444', colorLight: ['#FEF2F2','#FEE2E2'], status: 'ยังไม่จัด', done: false },
                { name: 'Paracetamol 500 mg',   desc: '2 เม็ด · PO · PRN ปวด/ไข้', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 },
                { name: 'Ondansetron 4 mg',     desc: '1 เม็ด · PO · PRN คลื่นไส้', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'คลื่นไส้/อาเจียน', interval: 8 }
            ]
        },
        '10': {
            avatar: 'ธก', name: 'นายธนกร วิเศษสิทธิ์', hn: '6405001', bed: '3A-10',
            age: 'ชาย, 40 ปี', allergy: '', round: 'รอบเช้า',
            tags: [],
            drugs: [
                { name: 'Amoxicillin 500 mg',   desc: '1 แคปซูล · PO · TID',      color: '#0D9488', colorLight: ['#F0FDF4','#DCFCE7'], status: 'จัดแล้ว ✓', done: true },
                { name: 'Paracetamol 500 mg',   desc: '2 เม็ด · PO · PRN ปวด/ไข้', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 },
                { name: 'Ibuprofen 400 mg',     desc: '1 เม็ด · PO · PRN ปวด (หลังอาหาร)', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด', interval: 8 }
            ]
        },
        '12': {
            avatar: 'ปส', name: 'นายประสิทธิ์ แก้วงาม', hn: '6406234', bed: '3A-12',
            age: 'ชาย, 63 ปี', allergy: 'แพ้ยา: Codeine', round: 'รอบเช้า',
            tags: ['Drug Allergy'],
            drugs: [
                { name: 'Insulin Glargine 20u', desc: '1 dose · SC · OD เช้า',     color: '#EF4444', colorLight: ['#FEF2F2','#FEE2E2'], status: 'ยังไม่จัด', done: false, highAlert: true },
                { name: 'Metformin 500 mg',     desc: '1 เม็ด · PO · BID',          color: '#0D9488', colorLight: ['#F0FDFA','#CCFBF1'], status: 'ยังไม่จัด', done: false },
                { name: 'Paracetamol 500 mg',   desc: '2 เม็ด · PO · PRN ปวด/ไข้ (ห้ามใช้ Codeine)', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 }
            ]
        },
        '15': {
            avatar: 'สศ', name: 'นางสมศรี บุญมาก', hn: '6407890', bed: '3A-15',
            age: 'หญิง, 70 ปี', allergy: '', round: 'รอบเที่ยง',
            tags: ['Fall Risk'],
            drugs: [
                { name: 'Amlodipine 5 mg',            desc: '1 เม็ด · PO · OD เช้า',    color: '#3B82F6', colorLight: ['#EFF6FF','#DBEAFE'], status: 'ยังไม่จัด', done: false },
                { name: 'Hydrochlorothiazide 25 mg',  desc: '1 เม็ด · PO · OD เช้า',    color: '#0D9488', colorLight: ['#F0FDFA','#CCFBF1'], status: 'ยังไม่จัด', done: false },
                { name: 'Paracetamol 500 mg',         desc: '2 เม็ด · PO · PRN ปวด/ไข้', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'ปวด/ไข้', interval: 6 },
                { name: 'Lorazepam 0.5 mg',           desc: '1 เม็ด · PO · PRN นอนไม่หลับ', color: '#7C3AED', colorLight: ['#F5F3FF','#EDE9FE'], status: 'ยังไม่จัด', done: false, prn: true, indication: 'นอนไม่หลับ', interval: 24 }
            ]
        }
    };

    // Now patientData exists — sync approved manual drugs into it
    try { syncApprovedDrugsToPatientData(); } catch(e) {}
    // Seed Order Plan from MedCartStore so Nurse Schedule / ตารางรอบยา has data
    try { if (typeof seedOrderPlanFromMedCartStore === 'function') seedOrderPlanFromMedCartStore(); } catch(e) { console.error('seedOrderPlan error:', e); }
    // Notify after seed so dashboard widgets pick up new data
    try { if (typeof MedCartStore !== 'undefined' && typeof MedCartStore._notify === 'function') MedCartStore._notify(); } catch(e) {}

    function cloneWardData(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function patientInitials(name) {
        return String(name || '')
            .replace(/^(นาย|นางสาว|นาง|นส\.|ด\.ช\.|ด\.ญ\.)\s*/,'')
            .replace(/\s+/g,'')
            .slice(0, 2) || 'ผป';
    }

    function patientGenderFromName(name) {
        const value = String(name || '');
        if (value.startsWith('นาง') || value.startsWith('นส.') || value.startsWith('ด.ญ.')) return 'หญิง';
        return 'ชาย';
    }

    const wardInfo = {
        'Ward 3A': { desc:'หอผู้ป่วยอายุรกรรม', floor:'ชั้น 3', beds:'24/30 เตียง', patients:'8 ผู้ป่วย', cart:'Med Cart A-1' },
        'Ward 3B': { desc:'ศัลยกรรมชาย', floor:'ชั้น 3', beds:'28/30 เตียง', patients:'26 ผู้ป่วย', cart:'Med Cart A-2' },
        'Ward 4A': { desc:'กุมารเวชกรรม', floor:'ชั้น 4', beds:'18/20 เตียง', patients:'15 ผู้ป่วย', cart:'Med Cart B-1' },
        'Ward 4B': { desc:'สูติ-นรีเวชกรรม', floor:'ชั้น 4', beds:'22/25 เตียง', patients:'20 ผู้ป่วย', cart:'Med Cart B-2' },
        'Ward 5A': { desc:'ออร์โธปิดิกส์', floor:'ชั้น 5', beds:'24/30 เตียง', patients:'22 ผู้ป่วย', cart:'Med Cart C-1' },
        'Ward 5B': { desc:'อายุรกรรมชาย', floor:'ชั้น 5', beds:'29/30 เตียง', patients:'29 ผู้ป่วย', cart:'Med Cart C-2' },
        'Ward 6A': { desc:'จักษุวิทยา', floor:'ชั้น 6', beds:'10/15 เตียง', patients:'8 ผู้ป่วย', cart:'Med Cart D-1' },
        'Ward 7A': { desc:'โสต ศอ นาสิก', floor:'ชั้น 7', beds:'12/20 เตียง', patients:'10 ผู้ป่วย', cart:'Med Cart D-2' },
        'ICU': { desc:'ผู้ป่วยวิกฤต', floor:'ชั้น 2', beds:'8/10 เตียง', patients:'8 ผู้ป่วย', cart:'Med Cart ICU-1' },
        'ER': { desc:'ห้องฉุกเฉิน', floor:'ชั้น 1', beds:'14/20 เตียง', patients:'11 ผู้ป่วย', cart:'Med Cart ER-1' }
    };

    const wardDrugSets = [
        [
            { name:'Amlodipine 5 mg', desc:'1 เม็ด · PO · รอบเช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Metformin 500 mg', desc:'1 เม็ด · PO · รอบเช้า', color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false },
            { name:'Omeprazole 20 mg', desc:'1 แคปซูล · PO · รอบเช้า', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false },
            { name:'Heparin 5000u', desc:'1 vial · SC · รอบเช้า', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true }
        ],
        [
            { name:'Losartan 50 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Simvastatin 20 mg', desc:'1 เม็ด · PO · OD ก่อนนอน', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'จัดแล้ว ✓', done:true },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · PRN pain/fever', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Amlodipine 10 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Metformin 500 mg', desc:'1 เม็ด · PO · BID', color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false },
            { name:'Enalapril 5 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#F59E0B', colorLight:['#FFFBEB','#FEF3C7'], status:'ยังไม่จัด', done:false },
            { name:'Furosemide 40 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Warfarin 3 mg', desc:'1 เม็ด · PO · OD ก่อนนอน', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true },
            { name:'Omeprazole 20 mg', desc:'1 แคปซูล · PO · OD', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Metformin 500 mg', desc:'1 เม็ด · PO · BID', color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false },
            { name:'Glipizide 5 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Atorvastatin 20 mg', desc:'1 เม็ด · PO · OD ก่อนนอน', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · PRN pain', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false },
            { name:'Amoxicillin 500 mg', desc:'1 แคปซูล · PO · TID', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'จัดแล้ว ✓', done:true }
        ],
        [
            { name:'Insulin Glargine 20u', desc:'1 dose · SC · OD เช้า', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true },
            { name:'Metformin 500 mg', desc:'1 เม็ด · PO · BID', color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Amlodipine 5 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Hydrochlorothiazide 25 mg', desc:'1 เม็ด · PO · OD เช้า', color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · PRN fever', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false }
        ]
    ];

    const ward5AOrthoDrugSets = [
        [
            { name:'Cefazolin 1 g', desc:'1 vial · IV · รอบเช้า', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · รอบเช้า', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false },
            { name:'Enoxaparin 40 mg', desc:'1 syringe · SC · OD เช้า', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true }
        ],
        [
            { name:'Celecoxib 200 mg', desc:'1 แคปซูล · PO · รอบเช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Omeprazole 20 mg', desc:'1 แคปซูล · PO · รอบเช้า', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false },
            { name:'Tramadol 50 mg', desc:'1 เม็ด · PO · PRN pain', color:'#F59E0B', colorLight:['#FFFBEB','#FEF3C7'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Warfarin 3 mg', desc:'1 เม็ด · PO · OD ก่อนนอน', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · รอบเช้า', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false },
            { name:'Calcium Carbonate 600 mg', desc:'1 เม็ด · PO · รอบเช้า', color:'#14B8A6', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false },
            { name:'Vitamin D3 1000 IU', desc:'1 เม็ด · PO · รอบเช้า', color:'#F59E0B', colorLight:['#FFFBEB','#FEF3C7'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Cefazolin 1 g', desc:'1 vial · IV · รอบเที่ยง', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false },
            { name:'Morphine 5 mg', desc:'5 mg · IV · PRN severe pain', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · รอบเที่ยง', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'จัดแล้ว ✓', done:true }
        ],
        [
            { name:'Gabapentin 300 mg', desc:'1 แคปซูล · PO · ก่อนนอน', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false },
            { name:'Celecoxib 200 mg', desc:'1 แคปซูล · PO · รอบเย็น', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Omeprazole 20 mg', desc:'1 แคปซูล · PO · รอบเย็น', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'จัดแล้ว ✓', done:true }
        ],
        [
            { name:'Enoxaparin 40 mg', desc:'1 syringe · SC · OD เช้า', color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'], status:'ยังไม่จัด', done:false, highAlert:true },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · PRN pain/fever', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false },
            { name:'Docusate 100 mg', desc:'1 แคปซูล · PO · ก่อนนอน', color:'#14B8A6', colorLight:['#F0FDFA','#CCFBF1'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Cefazolin 1 g', desc:'1 vial · IV · รอบเช้า', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'จัดแล้ว ✓', done:true },
            { name:'Tramadol 50 mg', desc:'1 เม็ด · PO · PRN pain', color:'#F59E0B', colorLight:['#FFFBEB','#FEF3C7'], status:'ยังไม่จัด', done:false },
            { name:'Gabapentin 300 mg', desc:'1 แคปซูล · PO · ก่อนนอน', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false }
        ],
        [
            { name:'Aspirin 81 mg', desc:'1 เม็ด · PO · รอบเช้า', color:'#3B82F6', colorLight:['#EFF6FF','#DBEAFE'], status:'ยังไม่จัด', done:false },
            { name:'Omeprazole 20 mg', desc:'1 แคปซูล · PO · รอบเช้า', color:'#8B5CF6', colorLight:['#F5F3FF','#EDE9FE'], status:'ยังไม่จัด', done:false },
            { name:'Paracetamol 500 mg', desc:'2 เม็ด · PO · รอบเย็น', color:'#0D9488', colorLight:['#F0FDF4','#DCFCE7'], status:'ยังไม่จัด', done:false }
        ]
    ];

    const wardPatientProfiles = {
        'Ward 3B': { hnPrefix:'6413', names:['นายกิตติ ศัลยดี','นายอำนาจ ผ่าตัด','นายมนตรี ใจกล้า','นายสาธิต ฟื้นดี','นายปรีชา ทรงพล','นายจักรินทร์ ภูผา','นายพิทักษ์ ว่องไว','นายอนันต์ ศรีชัย'], ages:[61,55,49,67,72,44,59,63] },
        'Ward 4A': { hnPrefix:'6424', names:['ด.ช.ธาม นวลจันทร์','ด.ญ.ใบบัว แสงดี','ด.ช.ภาคิน เรืองฤทธิ์','ด.ญ.มินตรา ดาวเรือง','ด.ช.ปุณณ์ สายชล','ด.ญ.พิมพ์ดาว อ่อนหวาน','ด.ช.กวิน ทองดี','ด.ญ.น้ำฝน ศรีสุข'], ages:[7,5,9,6,11,8,4,10] },
        'Ward 4B': { hnPrefix:'6428', names:['นางสาวอรพิน คล่องดี','นางมยุรี แก้วใส','นางสาวพิมลวรรณ ศรีทอง','นางสาวกานต์ธิดา สุขสันต์','นางรัตนา ชื่นชม','นางสาวศศิธร บุญช่วย','นางอารีย์ ใจเย็น','นางสาววราภรณ์ แสงทอง'], ages:[31,38,29,34,42,27,36,30] },
        'Ward 5A': {
            hnPrefix:'6451',
            keys:['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22'],
            names:['นายภูริทัต เข้มแข็ง','นางสาวชนากานต์ เดินดี','นายอดิศักดิ์ กระดูกดี','นายวรวุฒิ แก้วทน','นางจิตรา ยืนยง','นายธวัชชัย ตั้งตรง','นางสาวนลินี ฟื้นแรง','นายเอกชัย ทรงพลัง','นางสาวกมลชนก ก้าวดี','นายปกรณ์ ตั้งมั่น','นางสุพัตรา ฟื้นไว','นายธีรภัทร กระดูกแข็ง','นางสาววิภาวี ลุกเดิน','นายกษิดิศ ข้อเข่า','นายชลิต หลังผ่า','นางมณฑา เดินคล่อง','นายกิตติพงศ์ ขยับดี','นางสาวณัฐธิดา กลับบ้าน','นายศรัณย์ เอ็นแข็ง','นางสาวภัทรา ไหล่ดี','นายมนตรี เฝือกเบา','นางอารีรัตน์ ฟื้นตัว'],
            ages:[52,43,64,58,70,47,39,66,34,56,62,45,29,73,51,68,41,36,55,48,60,67],
            drugSets: ward5AOrthoDrugSets
        },
        'Ward 5B': { hnPrefix:'6455', names:['นายสุเมธ ใจมั่น','นายวิโรจน์ รักษ์สุข','นายประเวศ ทองแท้','นายไพโรจน์ มีแรง','นายสกล ชื่นบาน','นายชาญชัย สดใส','นายภาคภูมิ แก้วกล้า','นายประมวล เก่งงาน'], ages:[60,54,73,66,49,58,44,69] },
        'Ward 6A': { hnPrefix:'6461', names:['นางสาววารี มองชัด','นายธีรเดช ตาดี','นางสมพร แสงแก้ว','นายณัฐพล ใจสว่าง','นางสาวชลธิชา ฟ้าใส','นายศุภชัย เห็นดี','นางอัมพร สุขตา','นายก้องภพ ประกาย'], ages:[46,57,68,42,35,63,71,50] },
        'Ward 7A': { hnPrefix:'6471', names:['นายธนา เสียงใส','นางสาวเบญจพร ฟังดี','นายรณชัย หายใจคล่อง','นางกมลวรรณ พูดชัด','นายทศพล คอแข็ง','นางสาวธิดารัตน์ จมูกดี','นายวิศรุต คล่องเสียง','นางเพ็ญศรี ใจเย็น'], ages:[39,45,52,48,61,34,44,69] },
        'ICU': { hnPrefix:'6490', names:['นายวรเมธ วิกฤตดี','นางสาวศิริพร เฝ้าระวัง','นายกฤษฎา ชีพจร','นางละออง หายใจดี','นายภาณุวัฒน์ ความดัน','นางสาวณิชา ฟื้นตัว','นายสมบัติ ออกซิเจน','นางวาสนา ใจสู้'], ages:[66,41,58,72,64,37,70,55] },
        'ER': { hnPrefix:'6480', names:['นายเอกพล เร่งด่วน','นางสาวปวีณา ฉับไว','นายสิทธิชัย อุบัติเหตุ','นางรจนา เจ็บแน่น','นายพงษ์เทพ ด่วนมาก','ด.ช.ต้นกล้า เล่นซน','นางสาวมาริสา ปวดท้อง','นายณรงค์ชัย ใจเร็ว'], ages:[36,29,47,52,40,8,33,61] }
    };

    function makeWardPatientData(wardName, profile) {
        const keys = profile.keys || ['01','02','03','05','08','10','12','15'];
        const wardPrefix = wardName.replace(/^Ward\s+/,'');
        const allergies = ['', 'แพ้ยา: Aspirin', '', 'แพ้ยา: NSAIDs', '', '', 'แพ้ยา: Codeine', ''];
        const tagSets = [[], ['Drug Allergy'], ['Fall Risk'], ['Fall Risk','Drug Allergy'], [], [], ['Drug Allergy'], ['Fall Risk']];
        const rounds = ['รอบเช้า','รอบเช้า','รอบเช้า','รอบเช้า','รอบเช้า','รอบเช้า','รอบเที่ยง','รอบเที่ยง'];
        const drugSets = profile.drugSets || wardDrugSets;
        return keys.reduce(function(acc, key, idx) {
            const name = profile.names[idx] || ('ผู้ป่วย ' + wardName + '-' + key);
            const gender = patientGenderFromName(name);
            const age = profile.ages[idx] || (gender === 'หญิง' ? 45 : 58);
            acc[key] = {
                avatar: patientInitials(name),
                name: name,
                hn: profile.hnPrefix + String(idx + 1).padStart(3, '0'),
                bed: wardPrefix + '-' + key,
                age: gender + ', ' + age + ' ปี',
                allergy: allergies[idx % allergies.length],
                round: rounds[idx % rounds.length],
                tags: cloneWardData(tagSets[idx % tagSets.length] || []),
                drugs: cloneWardData(drugSets[idx % drugSets.length])
            };
            return acc;
        }, {});
    }

    const wardPatientDataTemplates = { 'Ward 3A': cloneWardData(patientData) };
    Object.keys(wardPatientProfiles).forEach(function(wardName) {
        wardPatientDataTemplates[wardName] = makeWardPatientData(wardName, wardPatientProfiles[wardName]);
    });

    let currentPatientBed = '01';

    function goToPatientDrugs(bedNum) {
        currentPatientBed = bedNum;
        const pt = patientData[bedNum];
        if (!pt) return;
        // Avatar
        document.getElementById('ptDrugAvatar').textContent = pt.avatar;
        // Name
        document.getElementById('ptDrugName').textContent = pt.name;
        // HN
        document.getElementById('ptDrugHN').textContent = 'HN: ' + pt.hn;
        // Bed
        document.getElementById('ptDrugBed').textContent = 'เตียง ' + pt.bed;
        // Age
        document.getElementById('ptDrugAge').textContent = pt.age;
        // Allergy
        const allergyRow = document.getElementById('ptDrugAllergyRow');
        if (pt.allergy) {
            allergyRow.style.display = 'flex';
            document.getElementById('ptDrugAllergy').textContent = pt.allergy;
        } else {
            allergyRow.style.display = 'none';
        }
        // Round
        document.getElementById('ptDrugRound').innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + pt.round;
        // Tags
        const tagsEl = document.getElementById('ptDrugTags');
        if (pt.tags.length === 0) {
            tagsEl.style.display = 'none';
        } else {
            tagsEl.style.display = 'flex';
            tagsEl.innerHTML = pt.tags.map(t => {
                const icon = t === 'Fall Risk'
                    ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="#DC2626" stroke="none"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z"/></svg>'
                    : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>';
                return '<span style="background:linear-gradient(135deg,#FEF2F2,#FEE2E2);color:#DC2626;font-size:10px;font-weight:700;padding:4px 10px;border-radius:8px;border:1px solid #FECACA;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">' + icon + ' ' + t + '</span>';
            }).join('');
        }
        // Drug count (only pending) — filter if nurse approved mode
        var displayDrugs = filterDrugsIfApprovedMode(pt.drugs);
        const pendingDrugs = displayDrugs.filter(d => !d.done);
        document.getElementById('ptDrugCountLabel').textContent = 'รายการยา (' + pendingDrugs.length + ')';
        // Drug list
        const listEl = document.getElementById('ptDrugList');
        listEl.innerHTML = displayDrugs.map(d => {
            const cl = d.colorLight || ['#F8FAFC','#F1F5F9'];
            const borderColor = d.done ? 'rgba(13,148,136,0.1)' : (d.highAlert ? 'rgba(239,68,68,0.2)' : 'rgba(' + hexToRgb(d.color || '#7C3AED') + ',0.15)');
            const statusBg = d.done ? 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' : 'linear-gradient(135deg,' + cl[0] + ',' + cl[1] + ')';
            const statusColor = d.done ? 'var(--green)' : (d.color || '#7C3AED');
            const opacity = d.done ? 'opacity:.55;' : '';
            const shadow = d.highAlert ? '0 2px 12px rgba(239,68,68,0.06)' : '0 2px 12px rgba(0,0,0,0.03)';
            const haLabel = haBadge(d.name);
            const dColor = d.color || '#7C3AED';
            const iconSvg = d.highAlert
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + dColor + '" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + dColor + '" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="4"/><line x1="6" y1="12" x2="18" y2="12"/></svg>';
            return '<div style="background:rgba(255,255,255,0.72);backdrop-filter:blur(16px);border:1px solid ' + borderColor + ';border-left:4px solid ' + dColor + ';border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:14px;box-shadow:' + shadow + ';transition:all 0.2s ease;' + opacity + '">'
                + '<div style="width:40px;height:40px;background:linear-gradient(135deg,' + cl[0] + ',' + cl[1] + ');border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + iconSvg + '</div>'
                + '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:700;color:var(--text-1);line-height:1.3;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' + d.name + haLabel + '</div><div style="font-size:11px;color:var(--text-3);margin-top:1px;">' + (d.desc || d.dose + ' · ' + (d.route||'') + ' · ' + (d.freq||d.schedule||'')) + '</div></div>'
                + '<span style="padding:4px 12px;border-radius:8px;font-size:10px;font-weight:700;background:' + statusBg + ';color:' + statusColor + ';border:1px solid rgba(' + hexToRgb(dColor) + ',0.2);white-space:nowrap;">' + (d.status || 'รอจัด') + '</span>'
                + '</div>';
        }).join('');
        // Reset steps
        const step1 = document.getElementById('ptDrugStep1');
        const step2 = document.getElementById('ptDrugStep2');
        if (step1) { step1.style.border = '2px solid #3B82F6'; }
        if (step2) { step2.style.opacity = '0.5'; step2.style.pointerEvents = 'none'; }
        const startBtn = document.getElementById('ptDrugStartBtn');
        if (startBtn) { startBtn.disabled = true; startBtn.style.opacity = '0.4'; startBtn.style.cursor = 'not-allowed'; }
        // Navigate
        nav('pg-prep-pt-drugs');
    }

    /* ── Drawer / Cassette selection (shared for both pages) ── */
    let ptdSelectedDrawer = 0;
    let ptdSelectedCass = 0;
    let ptdSelectedMode = null;

    const cassetteModeConfig = {
        patient: {
            label: 'จัดตามผู้ป่วย',
            short: 'ผู้ป่วย',
            dashboardLabel: 'By Patient',
            mapLabel: 'By Pt',
            className: 'mode-patient',
            chip: 'Patient',
            chipBg: 'linear-gradient(135deg,var(--green),#14B8A6)',
            statusBg: 'var(--green-light)',
            statusColor: 'var(--green)'
        },
        medication: {
            label: 'จัดตามรายการยา',
            short: 'รายการยา',
            dashboardLabel: 'By Item',
            mapLabel: 'By Item',
            className: 'mode-medication',
            chip: 'Item',
            chipBg: 'linear-gradient(135deg,#2563EB,#3B82F6)',
            statusBg: '#DBEAFE',
            statusColor: '#2563EB'
        },
        schedule: {
            label: 'จัดตามรอบเวลา',
            short: 'รอบเวลา',
            dashboardLabel: 'By Round',
            mapLabel: 'By Round',
            className: 'mode-schedule',
            chip: 'Round',
            chipBg: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
            statusBg: '#EDE9FE',
            statusColor: '#7C3AED'
        },
        prn: {
            label: 'ยาสำรอง (PRN)',
            short: 'PRN',
            dashboardLabel: 'PRN',
            mapLabel: 'PRN',
            className: 'mode-prn',
            chip: 'PRN',
            chipBg: 'linear-gradient(135deg,#BE185D,#DB2777)',
            statusBg: '#FCE7F3',
            statusColor: '#BE185D'
        }
    };
    const cassetteModeLocks = {};
    const cassetteModeCompleted = {};
    const CASSETTE_LOCK_STORE = 'mcCassetteModeLocks';
    const CASSETTE_COMPLETED_STORE = 'mcCassetteModeCompleted';

    function persistCassetteModeState() {
        try {
            sessionStorage.setItem(CASSETTE_LOCK_STORE, JSON.stringify(cassetteModeLocks));
            sessionStorage.setItem(CASSETTE_COMPLETED_STORE, JSON.stringify(cassetteModeCompleted));
        } catch (e) {}
    }

    function loadCassetteModeState() {
        try {
            const locks = JSON.parse(sessionStorage.getItem(CASSETTE_LOCK_STORE) || '{}') || {};
            const completed = JSON.parse(sessionStorage.getItem(CASSETTE_COMPLETED_STORE) || '{}') || {};
            Object.assign(cassetteModeLocks, locks);
            Object.assign(cassetteModeCompleted, completed);
        } catch (e) {}
    }

    loadCassetteModeState();

    // Map page IDs to their element IDs
    const hwPageMap = {
        'pg-prep-pt-drugs': { status:'ptdHwStatus', cassArea:'ptdCassArea', summary:'ptdSelSummary', sumText:'ptdSelText', startBtn:'ptDrugStartBtn', mode:'patient' },
        'pg-prep-med-detail': { status:'mdHwStatus', cassArea:'mdCassArea', summary:'mdSelSummary', sumText:'mdSelText', startBtn:'mdStartBtn', mode:'medication' },
        'pg-sched-detail': { status:'trfHwStatus', cassArea:null, summary:'trfSelSummary', sumText:'trfSelText', startBtn:null, mode:'schedule' }
    };
    prepHardwareReady = true;

    function getHwIds(el) {
        const page = el.closest('.page');
        if (!page) return { page: null, ids: null };
        const pageId = page.id;
        return { page, ids: hwPageMap[pageId] || null };
    }

    function ptdCassetteKey(drawer, cass) {
        return drawer + ':' + cass;
    }

    function ptdCurrentCassetteKey() {
        if (!ptdSelectedDrawer || !ptdSelectedCass) return '';
        return ptdCassetteKey(ptdSelectedDrawer, ptdSelectedCass);
    }

    function getCassetteSingleDrug(key) {
        const lock = cassetteModeLocks[key] || cassetteModeCompleted[key];
        if (!lock) return null;
        const names = getLockDrugNames(lock);
        return names.length ? names[0] : (lock.drugName || null);
    }

    function getLockDrugNames(lock) {
        if (!lock) return [];
        if (Array.isArray(lock.drugNames)) return lock.drugNames.filter(Boolean);
        if (Array.isArray(lock.cassetteItems)) {
            const seen = {};
            return lock.cassetteItems.map(function(item) {
                return item && (item.drugName || item.name);
            }).filter(function(name) {
                const key = normalizeIbfDrugName(name);
                if (!key || seen[key]) return false;
                seen[key] = true;
                return true;
            });
        }
        return lock.drugName ? [lock.drugName] : [];
    }

    function cassetteItemUniqueKey(item) {
        if (!item) return '';
        if (item.sourceKey) return item.sourceKey;
        var name = normalizeIbfDrugName(item.drugName || item.name || '');
        if (!name) return '';
        // Use drugName + patientBed as key — same drug for same bed = same item in a cassette
        var bed = item.patientBed || item.bed || '';
        var slot = item.slot || '';
        return name + '|' + bed + '|' + slot;
    }

    function normalizeCassetteItem(item) {
        if (!item) return null;
        const drugName = item.drugName || item.name || '';
        if (!drugName) return null;
        const lotInfo = drugLotMap[drugName] || {};
        return Object.assign({}, item, {
            drugName: drugName,
            patientName: item.patientName || item.patient || '',
            patientBed: item.patientBed || item.bed || '',
            patientHn: item.patientHn || item.hn || '',
            dose: item.dose || item.qtyText || '',
            route: item.route || '',
            round: item.round || '',
            lot: item.lot || lotInfo.lot || 'N/A',
            exp: item.exp || lotInfo.exp || 'N/A',
            slot: item.slot || '',
            status: item.status || (item.done ? 'จัดแล้ว' : 'รอจัด'),
            done: !!item.done,
            highAlert: !!(item.highAlert || isHighAlertDrug(drugName))
        });
    }

    function mergeCassetteItems(existing, incoming) {
        const byKey = {};
        (existing || []).concat(incoming || []).forEach(function(item) {
            const normalized = normalizeCassetteItem(item);
            if (!normalized) return;
            const key = cassetteItemUniqueKey(normalized);
            if (!key) return;
            byKey[key] = Object.assign({}, byKey[key] || {}, normalized);
        });
        return Object.values(byKey);
    }

    function cassetteDrugNamesFromItems(items) {
        const seen = {};
        return (items || []).map(function(item) {
            return item && item.drugName;
        }).filter(function(name) {
            const key = normalizeIbfDrugName(name);
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function cassetteItemFromPatientDrug(pt, key, drug, idx, extra) {
        if (!pt || !drug) return null;
        extra = extra || {};
        const view = legacyDrugView(drug, pt, idx);
        const lotInfo = drugLotMap[view.name] || { lot: view.lot || 'N/A', exp: view.exp || 'N/A' };
        const done = !!(drug.done || drug.prepared || extra.done);
        return normalizeCassetteItem(Object.assign({
            sourceKey: key + ':' + idx,
            key: key,
            drugIdx: idx,
            drugName: view.name,
            patientName: pt.name,
            patientBed: pt.bed,
            patientHn: pt.hn,
            dose: view.dose,
            route: view.routeShort,
            round: extra.round || prepRoundFromView(view, pt) || view.freq || pt.round || '',
            lot: lotInfo.lot || 'N/A',
            exp: lotInfo.exp || 'N/A',
            slot: extra.slot || '',
            status: done ? 'จัดแล้ว' : (extra.status || 'รอจัด'),
            done: done,
            highAlert: view.highAlert
        }, extra));
    }

    function buildPatientCassetteLockMeta() {
        const pt = patientData[currentPatientBed];
        if (!pt) return { cassetteItems: [], drugNames: [] };
        const useUiStatus = !!(document.getElementById('pg-prep-fill-pt') || {}).classList?.contains('active');
        const rows = useUiStatus ? Array.from(document.querySelectorAll('#pfListScroll .pf-drug-item')) : [];
        const items = [];
        (pt.drugs || []).forEach(function(drug, idx) {
            const view = legacyDrugView(drug, pt, idx);
            const preparedHere = String(drug.preparedDrawer || '') === String(ptdSelectedDrawer || '')
                && String(drug.preparedCassette || '') === String(ptdSelectedCass || '');
            if (view.done && !preparedHere) return;
            const uiIdx = pfDrugIndexes.indexOf(idx);
            const rowDone = uiIdx >= 0 && rows[uiIdx] && rows[uiIdx].classList.contains('done');
            const item = cassetteItemFromPatientDrug(pt, currentPatientBed, drug, idx, {
                done: rowDone || !!drug.done || !!drug.prepared,
                status: rowDone || drug.done || drug.prepared ? 'จัดแล้ว' : 'รอจัด'
            });
            if (item) items.push(item);
        });
        return {
            patientKey: currentPatientBed,
            patientName: pt.name,
            patientBed: pt.bed,
            patientHn: pt.hn,
            cassetteItems: items,
            drugNames: cassetteDrugNamesFromItems(items)
        };
    }

    function buildMedicationCassetteLockMeta() {
        const drug = getIbfDrugData(ibfDrugName);
        if (!drug) return { drugName: ibfDrugName, cassetteItems: [], drugNames: [ibfDrugName] };
        const useUiStatus = !!(document.getElementById('pg-ibf') || {}).classList?.contains('active');
        const rows = useUiStatus ? Array.from(document.querySelectorAll('#ibfDestScroll .pf-drug-item')) : [];
        const lotInfo = drugLotMap[ibfDrugName] || { lot:'N/A', exp:'N/A' };
        const items = (drug.patients || []).map(function(patient, idx) {
            const done = !!(rows[idx] && rows[idx].classList.contains('done'));
            return normalizeCassetteItem({
                sourceKey: (patient.key || patient.hn || patient.bed || patient.name || 'ibf') + ':' + (Number.isInteger(patient.drugIdx) ? patient.drugIdx : idx) + ':' + normalizeIbfDrugName(ibfDrugName),
                key: patient.key || '',
                drugIdx: patient.drugIdx,
                drugName: ibfDrugName,
                patientName: patient.name,
                patientBed: patient.bed,
                patientHn: patient.hn,
                dose: patient.qty + ' ' + patient.unit,
                route: drug.route || patient.route || '',
                round: patient.round || '',
                lot: lotInfo.lot,
                exp: lotInfo.exp,
                slot: patient.slot || ibfSlotLabel(idx),
                status: done ? 'จัดแล้ว' : 'รอจัด',
                done: done,
                highAlert: !!patient.highAlert || isHighAlertDrug(ibfDrugName),
                interactionSeverity: patient.interactionSeverity || '',
                interactionDrug: patient.interactionDrug || ''
            });
        });
        return {
            drugName: ibfDrugName,
            route: drug.route || '',
            cassetteItems: items,
            drugNames: cassetteDrugNamesFromItems(items)
        };
    }

    function buildScheduleCassetteLockMeta() {
        const rows = prepScheduleRows(currentPrepRound, false);
        const useUiStatus = !!(document.getElementById('pg-trf') || {}).classList?.contains('active');
        const queueRows = useUiStatus ? Array.from(document.querySelectorAll('#trfQueue .pf-drug-item')) : [];
        const items = rows.map(function(row, idx) {
            const done = !!(queueRows[idx] && queueRows[idx].classList.contains('done')) || !!row.view.done;
            return cassetteItemFromPatientDrug(row.pt, row.key, row.drug, row.idx, {
                round: row.round || currentPrepRound,
                dose: row.view.dose,
                route: row.view.routeShort,
                slot: ibfSlotLabel(idx),
                done: done,
                status: done ? 'จัดแล้ว' : 'รอจัด'
            });
        }).filter(Boolean);
        return {
            round: currentPrepRound,
            cassetteItems: items,
            drugNames: cassetteDrugNamesFromItems(items)
        };
    }

    function buildCassetteLockMetaForMode(mode) {
        if (mode === 'patient') return buildPatientCassetteLockMeta();
        if (mode === 'medication') return buildMedicationCassetteLockMeta();
        if (mode === 'schedule') return buildScheduleCassetteLockMeta();
        return {};
    }

    function ptdMedicationDrawerInteraction(drawerNum, drugName) {
        if (!drawerNum || !drugName) return { found: false };
        const existingDrugs = [];
        Object.values(cassetteModeLocks).forEach(function(lock) {
            if (!lock || lock.mode !== 'medication') return;
            if (lock.drawer !== drawerNum) return;
            if (lock.ward && lock.ward !== (currentWardName || DEFAULT_DEMO_WARD)) return;
            getLockDrugNames(lock).forEach(function(name) {
                if (normalizeIbfDrugName(name) !== normalizeIbfDrugName(drugName)) existingDrugs.push(name);
            });
        });
        return checkDrugInteraction(drugName, existingDrugs);
    }

    function markCurrentCassetteFilled() {
        const key = ptdCurrentCassetteKey();
        if (!key) return;
        const lock = cassetteModeLocks[key] || {};
        const mode = lock.mode || ptdSelectedMode || 'patient';
        const latestMeta = buildCassetteLockMetaForMode(mode) || {};
        // Use latest data as source of truth — don't merge with stale lock data
        const cassetteItems = (latestMeta.cassetteItems || lock.cassetteItems || []).map(normalizeCassetteItem).filter(Boolean);
        const latestDrugNames = cassetteDrugNamesFromItems(cassetteItems);
        cassetteModeCompleted[key] = Object.assign({}, lock, latestMeta, {
            mode: mode,
            drawer: ptdSelectedDrawer,
            cassette: ptdSelectedCass,
            ward: currentWardName || DEFAULT_DEMO_WARD,
            cassetteItems: cassetteItems,
            drugNames: latestDrugNames.length ? latestDrugNames : (Array.isArray(latestMeta.drugNames) && latestMeta.drugNames.length ? latestMeta.drugNames : getLockDrugNames(lock)),
            completedAt: new Date().toISOString()
        });
        persistCassetteModeState();
        if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
    }

    function ptdCassetteNum(slot) {
        const num = slot.querySelector('.ptd-cass-num');
        return num ? parseInt(num.textContent, 10) : NaN;
    }

    function ptdSetStartEnabled(page, ids, enabled) {
        if (ids && ids.startBtn) {
            const btn = document.getElementById(ids.startBtn);
            if (btn) {
                btn.disabled = !enabled;
                btn.style.opacity = enabled ? '1' : '0.4';
                btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
            }
        }
        page.querySelectorAll('.ptd-actions .btn-primary').forEach(btn => {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.4';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        });
    }

    function ptdSetHardwareStatus(ids, text, bg, color) {
        if (!ids || !ids.status) return;
        const status = document.getElementById(ids.status);
        if (!status) return;
        status.textContent = text;
        status.style.background = bg || '#DBEAFE';
        status.style.color = color || '#2563EB';
    }

    function ptdClearCassetteSelection(page, ids) {
        page.querySelectorAll('.ptd-cass-slot').forEach(slot => slot.classList.remove('selected'));
        if (ids && ids.summary) {
            const summary = document.getElementById(ids.summary);
            if (summary) summary.style.display = 'none';
        }
        ptdSetStartEnabled(page, ids, false);
    }

    function ptdSyncCassetteModeUI(page, drawerNum) {
        const ids = hwPageMap[page.id] || null;
        const pageMode = ids ? ids.mode : null;
        page.querySelectorAll('.ptd-cass-slot').forEach(slot => {
            if (slot.classList.contains('occupied') || slot.classList.contains('maintenance')) return;
            const cassNum = ptdCassetteNum(slot);
            if (!Number.isFinite(cassNum)) return;
            const lock = cassetteModeLocks[ptdCassetteKey(drawerNum, cassNum)];
            slot.classList.remove('mode-patient', 'mode-medication', 'mode-schedule', 'locked-other');
            const oldChip = slot.querySelector('.ptd-cass-mode-chip');
            if (oldChip) oldChip.remove();

            const status = slot.querySelector('.ptd-cass-status');
            if (!lock) {
                if (status) status.textContent = 'พร้อมเติมยา';
                return;
            }

            const cfg = cassetteModeConfig[lock.mode];
            if (!cfg) return;
            slot.classList.add(cfg.className);
            if (lock.mode !== pageMode) slot.classList.add('locked-other');
            if (status) status.textContent = 'ใช้: ' + cfg.short;

            const chip = document.createElement('span');
            chip.className = 'ptd-cass-mode-chip';
            chip.textContent = cfg.chip;
            chip.style.background = cfg.chipBg;
            slot.appendChild(chip);
        });
    }

    function resetCassetteModeLocks() {
        Object.keys(cassetteModeLocks).forEach(key => delete cassetteModeLocks[key]);
        Object.keys(cassetteModeCompleted).forEach(key => delete cassetteModeCompleted[key]);
        ptdSelectedDrawer = 0;
        ptdSelectedCass = 0;
        ptdSelectedMode = null;
        Object.entries(hwPageMap).forEach(([pageId, ids]) => {
            const page = document.getElementById(pageId);
            if (!page) return;
            page.querySelectorAll('.ptd-drawer-slot').forEach(slot => slot.classList.remove('selected'));
            page.querySelectorAll('.ptd-cass-area').forEach(area => area.classList.add('disabled'));
            if (ids.summary) {
                const summary = document.getElementById(ids.summary);
                if (summary) summary.style.display = 'none';
            }
            ptdSetHardwareStatus(ids, 'ยังไม่ได้เลือก', '#F1F5F9', 'var(--text-3)');
            ptdSetStartEnabled(page, ids, false);
        });
        document.querySelectorAll('.ptd-cass-slot').forEach(slot => {
            slot.classList.remove('selected', 'mode-patient', 'mode-medication', 'mode-schedule', 'locked-other');
            const chip = slot.querySelector('.ptd-cass-mode-chip');
            if (chip) chip.remove();
            const status = slot.querySelector('.ptd-cass-status');
            if (status && !slot.classList.contains('occupied')) status.textContent = 'พร้อมเติมยา';
        });
        closeDashboardDetailModals();
        persistCassetteModeState();
        if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
    }

    function ptdSelectDrawer(el, num) {
        ptdSelectedDrawer = num;
        ptdSelectedCass = 0;
        ptdSelectedMode = null;
        const { page, ids } = getHwIds(el);
        if (!page) return;
        // highlight drawer
        page.querySelectorAll('.ptd-drawer-slot').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        // enable cassette area
        page.querySelectorAll('.ptd-cass-area').forEach(a => a.classList.remove('disabled'));
        renderPrepCassetteGrid(page, num);
        // reset cassette selection
        page.querySelectorAll('.ptd-cass-slot').forEach(c => c.classList.remove('selected'));
        ptdSyncCassetteModeUI(page, num);
        // update status
        const modeLabel = ids && ids.mode && cassetteModeConfig[ids.mode] ? 'สำหรับ' + cassetteModeConfig[ids.mode].label : '';
        ptdSetHardwareStatus(ids, 'ชั้น ' + num + ' · เลือก Cassette ' + modeLabel, '#DBEAFE', '#2563EB');
        // hide summary & disable start
        if (ids && ids.summary) { const s = document.getElementById(ids.summary); if (s) s.style.display = 'none'; }
        ptdSetStartEnabled(page, ids, false);
    }

    function ptdSelectCass(el, num) {
        if (ptdSelectedDrawer === 0) return;
        const { page, ids } = getHwIds(el);
        if (!page) return;
        const mode = ids ? ids.mode : null;
        const cfg = cassetteModeConfig[mode] || null;
        const key = ptdCassetteKey(ptdSelectedDrawer, num);
        const existingLock = cassetteModeLocks[key];

        if (existingLock && mode && existingLock.mode !== mode) {
            const lockCfg = cassetteModeConfig[existingLock.mode] || { label: 'โหมดอื่น' };
            ptdSelectedCass = 0;
            ptdSelectedMode = null;
            ptdClearCassetteSelection(page, ids);
            ptdSyncCassetteModeUI(page, ptdSelectedDrawer);
            ptdSetHardwareStatus(ids, 'Cassette ' + num + ' ถูกใช้สำหรับ' + lockCfg.label, '#FEE2E2', '#B91C1C');
            showToast('Cassette ' + num + ' ถูกกำหนดไว้สำหรับ' + lockCfg.label + ' แล้ว');
            setTimeout(() => showToast(''), 2200);
            return;
        }

        // 1 Cassette = 1 drug rule
        const lockedDrug = getCassetteSingleDrug(key);
        const currentDrug = mode === 'medication' ? ibfDrugName : (mode === 'patient' ? (typeof currentIbfDrugForPatient !== 'undefined' ? currentIbfDrugForPatient : null) : null);
        if (lockedDrug && currentDrug && normalizeIbfDrugName(lockedDrug) !== normalizeIbfDrugName(currentDrug)) {
            ptdSelectedCass = 0;
            ptdSelectedMode = null;
            ptdClearCassetteSelection(page, ids);
            ptdSyncCassetteModeUI(page, ptdSelectedDrawer);
            ptdSetHardwareStatus(ids, 'Cassette ' + num + ' ผูกกับ ' + lockedDrug + ' แล้ว', '#FEE2E2', '#B91C1C');
            showToast('Cassette ' + num + ' ผูกกับ ' + lockedDrug + ' แล้ว — 1 Cassette ใส่ยาได้ 1 ชนิดเท่านั้น');
            setTimeout(() => showToast(''), 2800);
            return;
        }

        ptdSelectedCass = num;
        ptdSelectedMode = mode;

        ptdSyncCassetteModeUI(page, ptdSelectedDrawer);
        // highlight cassette
        page.querySelectorAll('.ptd-cass-slot').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        // update status
        const statusText = 'ชั้น ' + ptdSelectedDrawer + ' · Cassette ' + num + (cfg ? ' · ' + cfg.label : '');
        ptdSetHardwareStatus(ids, statusText, cfg ? cfg.statusBg : 'var(--green-light)', cfg ? cfg.statusColor : 'var(--green)');
        // show summary
        if (ids && ids.summary) { const s = document.getElementById(ids.summary); if (s) s.style.display = 'flex'; }
        if (ids && ids.sumText) {
            const t = document.getElementById(ids.sumText);
            if (t) t.textContent = 'เลือกแล้ว: ชั้น ' + ptdSelectedDrawer + ' · Cassette ' + num + (cfg ? ' · ' + cfg.label : '');
        }
        ptdSetStartEnabled(page, ids, true);
        if (mode === 'medication') {
            const interaction = ptdMedicationDrawerInteraction(ptdSelectedDrawer, ibfDrugName);
            if (interaction.found) {
                ptdSetHardwareStatus(ids, 'พบ Drug Interaction ในชั้น ' + ptdSelectedDrawer, '#FEE2E2', '#B91C1C');
                showInteractionModal(interaction, function() {});
            }
        }
    }

    // Commit the current cassette selection to the shared lock map and update Dashboard.
    // Called only when the user actually starts the prep flow (not during browsing).
    function ptdCommitCassetteLock(mode, meta) {
        if (!ptdSelectedDrawer || !ptdSelectedCass || !mode) return;
        meta = meta || {};
        const key = ptdCassetteKey(ptdSelectedDrawer, ptdSelectedCass);
        const previous = cassetteModeLocks[key] || {};

        // 1 Cassette = 1 drug rule: reject if trying to add a different drug
        const existingDrug = getCassetteSingleDrug(key);
        const incomingDrug = meta.drugName || (Array.isArray(meta.drugNames) && meta.drugNames[0]) || null;
        if (existingDrug && incomingDrug && normalizeIbfDrugName(existingDrug) !== normalizeIbfDrugName(incomingDrug)) {
            showToast('Cassette ' + ptdSelectedCass + ' ผูกกับ ' + existingDrug + ' แล้ว — ไม่สามารถใส่ยาชนิดอื่นได้');
            setTimeout(() => showToast(''), 2800);
            return;
        }

        const cassetteItems = mergeCassetteItems(previous.cassetteItems, meta.cassetteItems);
        const drugNames = getLockDrugNames(previous).concat(Array.isArray(meta.drugNames) ? meta.drugNames : []);
        if (meta.drugName && !drugNames.some(function(name) { return normalizeIbfDrugName(name) === normalizeIbfDrugName(meta.drugName); })) {
            drugNames.push(meta.drugName);
        }
        cassetteDrugNamesFromItems(cassetteItems).forEach(function(name) {
            if (!drugNames.some(function(existing) { return normalizeIbfDrugName(existing) === normalizeIbfDrugName(name); })) {
                drugNames.push(name);
            }
        });
        cassetteModeLocks[key] = Object.assign({}, previous, meta, {
            mode: mode,
            drawer: ptdSelectedDrawer,
            cassette: ptdSelectedCass,
            ward: currentWardName || DEFAULT_DEMO_WARD,
            cassetteItems: cassetteItems,
            drugNames: drugNames
        });
        persistCassetteModeState();
        if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return parseInt(hex.substring(0,2),16) + ',' + parseInt(hex.substring(2,4),16) + ',' + parseInt(hex.substring(4,6),16);
    }

    function pbpToggleView(mode) {
        const layout = document.getElementById('pbpLayout');
        const floor = document.getElementById('pbpFloorPlan');
        const btnGrid = document.getElementById('pbpBtnGrid');
        const btnList = document.getElementById('pbpBtnList');
        const activeStyle = 'padding:7px 16px;border:none;border-radius:8px;background:linear-gradient(135deg,var(--green),#14B8A6);color:white;font-family:\'Prompt\',sans-serif;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;box-shadow:0 2px 6px rgba(13,148,136,0.25);transition:all .25s ease;';
        const inactiveStyle = 'padding:7px 16px;border:none;border-radius:8px;background:transparent;color:var(--text-2);font-family:\'Prompt\',sans-serif;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .25s ease;';

        if (mode === 'list') {
            floor.style.opacity = '0';
            floor.style.transform = 'scale(0.95)';
            setTimeout(() => {
                floor.style.display = 'none';
                layout.style.gridTemplateColumns = '1fr';
            }, 200);
            btnList.style.cssText = activeStyle;
            btnList.querySelector('svg').setAttribute('stroke', 'white');
            btnGrid.style.cssText = inactiveStyle;
            btnGrid.querySelector('svg').setAttribute('stroke', 'currentColor');
        } else {
            floor.style.display = '';
            layout.style.gridTemplateColumns = '1fr 1fr';
            requestAnimationFrame(() => {
                floor.style.opacity = '1';
                floor.style.transform = 'scale(1)';
            });
            btnGrid.style.cssText = activeStyle;
            btnGrid.querySelector('svg').setAttribute('stroke', 'white');
            btnList.style.cssText = inactiveStyle;
            btnList.querySelector('svg').setAttribute('stroke', 'currentColor');
        }
    }

    /* ── Time round fill (Page 33) — same pattern as pfScanDrug ── */
    let trfActiveIdx = 0;
    let trfDoneCount = 0;
    const trfDrugNames = ['Amlodipine 5 mg','Metformin 500 mg','Omeprazole 20 mg','Amlodipine 5 mg','Metformin 500 mg','Omeprazole 20 mg','Enalapril 10 mg','Heparin 5000u'];
    const trfDestNames = ['สมชาย · 3A-01','สมชาย · 3A-01','สมชาย · 3A-01','มาลี · 3A-03','มาลี · 3A-03','พิมพ์ใจ · 3A-02','พิมพ์ใจ · 3A-02','สมชาย · 3A-01'];
    const trfQtys = ['1 เม็ด','1 เม็ด','1 แคปซูล','2 เม็ด','1 เม็ด','1 แคปซูล','2 เม็ด','1 vial'];
    let trfTargetRefs = [];

    let trfScannedSet = new Set();

    function trfSelect(el, idx) {
        trfActiveIdx = idx;
        document.querySelectorAll('#trfQueue .pf-drug-item').forEach(q => q.classList.remove('active'));
        if (!el.classList.contains('done') && !el.classList.contains('scanned')) el.classList.add('active');
    }

    function trfScan() {
        const items = document.querySelectorAll('#trfQueue .pf-drug-item');
        if (!items.length) { showToast('ไม่มีรายการรอจัดในรอบนี้'); setTimeout(() => showToast(''), 1500); return; }
        let scanIdx = trfActiveIdx;
        if (items[scanIdx] && (items[scanIdx].classList.contains('done') || items[scanIdx].classList.contains('scanned'))) {
            scanIdx = -1;
            for (let i = 0; i < items.length; i++) {
                if (!items[i].classList.contains('done') && !items[i].classList.contains('scanned')) { scanIdx = i; break; }
            }
        }
        if (scanIdx === -1) { showToast('สแกนครบทุกรายการแล้ว'); setTimeout(() => showToast(''), 1500); return; }
        if (!items[scanIdx]) { showToast('ไม่มีรายการรอจัดในรอบนี้'); setTimeout(() => showToast(''), 1500); return; }

        // Check drug interaction with already scanned/done drugs only
        var alreadyInTrf = [];
        var trfItems = document.querySelectorAll('#trfQueue .pf-drug-item');
        trfItems.forEach(function(item, i) {
            if ((item.classList.contains('done') || item.classList.contains('scanned')) && i !== scanIdx) {
                alreadyInTrf.push(trfDrugNames[i]);
            }
        });
        if (alreadyInTrf.length > 0) {
            var interaction = checkDrugInteraction(trfDrugNames[scanIdx], alreadyInTrf);
            if (interaction.found) { showInteractionModal(interaction); return; }
        }

        // If High Alert drug — require witness scan
        if (isHighAlertDrug(trfDrugNames[scanIdx])) {
            var _si2 = scanIdx;
            var lotHA2 = drugLotMap[trfDrugNames[_si2]] || { lot:'N/A' };
            showHAVerifyModal(trfDrugNames[_si2], lotHA2.lot, function() {
                trfMarkScanned(_si2);
                showToast('พยานยืนยัน High Alert สำเร็จ — ' + trfDrugNames[_si2]);
                setTimeout(function(){ showToast(''); }, 2000);
            }, "prep");
            return;
        }

        trfMarkScanned(scanIdx);
    }
    function trfMarkScanned(scanIdx) {
        var items = document.querySelectorAll('#trfQueue .pf-drug-item');
        // Mark as scanned
        trfScannedSet.add(scanIdx);
        items[scanIdx].classList.remove('active');
        items[scanIdx].classList.add('scanned');
        items[scanIdx].style.borderColor = '#7C3AED';
        items[scanIdx].style.background = 'linear-gradient(135deg,#F5F3FF,#EDE9FE)';
        items[scanIdx].querySelector('.pf-drug-check').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
        items[scanIdx].querySelector('.pf-drug-check').style.borderColor = '#7C3AED';
        items[scanIdx].querySelector('.pf-drug-check').style.background = 'rgba(124,58,237,0.08)';

        // Update scan result list
        trfUpdateScanList();

        // Enable confirm
        document.getElementById('trfBtnConfirm').disabled = false;
        document.getElementById('trfBtnConfirm').style.opacity = '1';
        document.getElementById('trfBtnConfirm').style.cursor = 'pointer';

        const drugName = trfDrugNames[scanIdx] || 'ยา';
        showToast('สแกน ' + drugName + ' สำเร็จ (' + trfScannedSet.size + '/' + trfDrugNames.length + ')');
        setTimeout(() => showToast(''), 1500);
    }

    function trfUpdateScanList() {
        const container = document.getElementById('trfScanResult');
        if (trfScannedSet.size === 0) { container.style.display = 'none'; return; }
        container.style.display = '';
        let html = '<div class="pf-result-head" style="background:linear-gradient(135deg,#F5F3FF,#EDE9FE);border-bottom-color:rgba(124,58,237,0.1);">'
            + '<span class="pf-result-badge" style="background:linear-gradient(135deg,#EDE9FE,#DDD6FE);color:#7C3AED;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> สแกนแล้ว ' + trfScannedSet.size + ' รายการ</span>'
            + '<span class="pf-result-name">พร้อมยืนยันเข้าช่อง</span></div>';
        html += '<div style="padding:12px 16px;display:flex;flex-direction:column;gap:6px;">';
        trfScannedSet.forEach(idx => {
            const drugName = trfDrugNames[idx] || 'ยา';
            const lotInfo = drugLotMap[drugName] || { lot:'N/A', exp:'N/A' };
            html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:linear-gradient(135deg,#F5F3FF,#EDE9FE);border:1px solid rgba(124,58,237,0.12);border-radius:10px;">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
                + '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text-1);">' + drugName + '</div>'
                + '<div style="font-size:10px;color:var(--text-3);">' + (trfDestNames[idx]||'') + ' · ' + (trfQtys[idx]||'') + ' · Lot: ' + lotInfo.lot + '</div></div>'
                + '<span style="font-size:10px;font-weight:700;color:#7C3AED;">ตรงกัน</span>'
                + '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function trfConfirm() {
        const items = document.querySelectorAll('#trfQueue .pf-drug-item');
        trfScannedSet.forEach(idx => {
            const item = items[idx];
            if (item && !item.classList.contains('done')) {
                item.classList.remove('scanned');
                item.classList.add('done');
                item.style.borderColor = 'transparent';
                item.style.background = '';
                item.querySelector('.pf-drug-check').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                item.querySelector('.pf-drug-check').style.borderColor = '#7C3AED';
                item.querySelector('.pf-drug-check').style.background = '#7C3AED';
                trfDoneCount++;
            }
        });
        document.getElementById('trfDone').textContent = trfDoneCount;
        const trfTotal = trfDrugNames.length;
        document.getElementById('trfLeft').textContent = trfTotal - trfDoneCount;
        trfScannedSet.clear();
        document.getElementById('trfScanResult').style.display = 'none';
        document.getElementById('trfBtnConfirm').disabled = true;
        document.getElementById('trfBtnConfirm').style.opacity = '0.4';
        document.getElementById('trfBtnConfirm').style.cursor = 'not-allowed';
        ptdCommitCassetteLock('schedule', buildScheduleCassetteLockMeta());

        // Enable summary if at least 1 done
        if (trfDoneCount > 0) {
            const sumBtn = document.getElementById('trfBtnSummary');
            if (sumBtn) { sumBtn.disabled = false; sumBtn.style.opacity = '1'; sumBtn.style.cursor = 'pointer'; }
        }
        if (trfDoneCount >= trfTotal) {
            markCurrentCassetteFilled();
            showToast('จัดยาครบทุกรายการในรอบนี้แล้ว — ไปสรุปผลได้');
        } else {
            showToast('ยืนยัน ' + trfDoneCount + '/' + trfTotal + ' — สแกนรายการถัดไปได้เลย');
        }
        setTimeout(() => showToast(''), 2000);
    }

    function trfPopulateSummary() {
        setSummaryFlow({ mode: 'schedule', editPage: 'pg-trf', continuePage: 'pg-prep-sched' });
        const total = trfDrugNames.length;
        const items = document.querySelectorAll('#trfQueue .pf-drug-item');
        const doneFlags = [];
        items.forEach(function(item) { doneFlags.push(item.classList.contains('done')); });
        const doneCount = doneFlags.filter(Boolean).length;
        const notDone = total - doneCount;
        const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

        document.getElementById('sumContext').innerHTML =
            '<span class="fill-ctx-chip">รอบ: <strong>' + currentPrepRound + '</strong></span>'
            + '<span class="fill-ctx-chip">เวลา: <strong>' + (currentPrepRound === 'รอบเที่ยง' ? '11:00 – 12:00 น.' : currentPrepRound === 'รอบเย็น' ? '16:00 – 18:00 น.' : currentPrepRound === 'ก่อนนอน' ? '20:00 – 22:00 น.' : '06:00 – 08:00 น.') + '</strong></span>'
            + '<span class="fill-ctx-chip">Ward: <strong>' + (currentWardName || DEFAULT_DEMO_WARD) + '</strong></span>'
            + '<span class="fill-ctx-chip">ชั้น / Cassette: <strong>' + ptdSelectedDrawer + ' / ' + ptdSelectedCass + '</strong></span>'
            + '<span class="fill-ctx-chip">ประเภท: <strong>ตามรอบเวลา</strong></span>';

        document.getElementById('sumStats').innerHTML =
            '<div class="ss"><div class="ss-num blue">' + total + '</div><div class="ss-label">รายการทั้งหมด</div></div>'
            + '<div class="ss"><div class="ss-num green">' + doneCount + '</div><div class="ss-label">จัดครบแล้ว</div></div>'
            + '<div class="ss"><div class="ss-num amber">' + notDone + '</div><div class="ss-label">ยังไม่จัด</div></div>'
            + '<div class="ss"><div class="ss-num red">0</div><div class="ss-label">มีปัญหา</div></div>';

        document.getElementById('sumProgress').innerHTML =
            '<div class="sp-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
            + '<div class="sp-bar-wrap"><div class="sp-label-row"><span class="sp-label">ความคืบหน้า</span><span class="sp-pct">' + pct + '%</span></div><div class="sp-track"><div class="sp-fill" style="width:' + pct + '%"></div></div></div>';

        var tableHtml = '<div class="sum-table-head"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> จัดยารอบเช้า — Work Queue</div>';
        tableHtml += '<div class="st-row header-row"><div>ยา / ผู้ป่วย</div><div style="text-align:center">จำนวน</div><div style="text-align:center">Lot / Expiry</div><div style="text-align:center">Slot</div><div style="text-align:center">สถานะ</div></div>';
        for (var i = 0; i < total; i++) {
            var isDone = doneFlags[i] || false;
            var drugName = trfDrugNames[i] || '';
            var lotInfo = drugLotMap[drugName] || { lot:'N/A', exp:'N/A' };
            var fixBtn = !isDone
                ? '<button onclick="goSummaryBack()" style="margin-top:4px;padding:3px 10px;border-radius:8px;border:1.5px solid #F59E0B;background:#FFFBEB;color:#B45309;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Prompt\',sans-serif;">แก้ไข →</button>'
                : '';
            var statusHtml = isDone
                ? '<span class="st-status ok"><span class="dot"></span> สำเร็จ</span>'
                : '<div style="text-align:center"><span class="st-status warn">ยังไม่จัด</span></div>';
            var rowBg = isDone ? '' : ' style="background:#fffbeb;"';
            tableHtml += '<div class="st-row"' + rowBg + '>'
                + '<div><div class="st-name">' + drugName + '</div><div class="st-sub">' + (trfDestNames[i]||'') + '</div>' + fixBtn + '</div>'
                + '<div class="st-val">' + (trfQtys[i]||'') + '</div>'
                + '<div class="st-val">' + (isDone ? lotInfo.lot + ' · ' + lotInfo.exp : '—') + '</div>'
                + '<div class="st-val">—</div>'
                + '<div style="text-align:center">' + statusHtml + '</div>'
                + '</div>';
        }
        document.getElementById('sumTable').innerHTML = tableHtml;
        nav('pg-summary');
    }

    /* ── Time round detail toggle (Page 32) ── */
    function trdSwitch(view, btn) {
        document.querySelectorAll('.trd-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('trdViewPt').style.display = view === 'patient' ? '' : 'none';
        document.getElementById('trdViewDrug').style.display = view === 'drug' ? '' : 'none';
    }

    /* ── Item-based fill (Page 30) ── */
    let ibfActiveIdx = 0;
    let ibfDoneCount = 0;
    let ibfTotalQty = 6;
    let ibfQtys = [1,2,1,2];
    let ibfDrugName = 'Amlodipine 5 mg';
    let ibfDrugCode = 'DRG-00421';
    let ibfTargetRefs = [];

    const ibfDrugData = {
        'Amlodipine 5 mg': {
            code: 'DRG-00421', form: 'เม็ด (Tablet)', route: 'PO', totalQty: 6, stock: 120,
            patients: [
                { name: 'สมชาย มานะ', bed: '3A-01', slot: 'Slot A-01', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'มาลี สุขใจ', bed: '3A-03', slot: 'Slot A-03', qty: 2, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'กัลยา ชัยวงศ์', bed: '3A-08', slot: 'Slot B-01', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'ประสิทธิ์ แก้วงาม', bed: '3A-12', slot: 'Slot B-04', qty: 2, unit: 'เม็ด', round: 'รอบเที่ยง' }
            ]
        },
        'Metformin 500 mg': {
            code: 'DRG-00532', form: 'เม็ด (Tablet)', route: 'PO', totalQty: 4, stock: 200,
            patients: [
                { name: 'สมชาย มานะ', bed: '3A-01', slot: 'Slot A-01', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'กัลยา ชัยวงศ์', bed: '3A-08', slot: 'Slot B-01', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'มาลี สุขใจ', bed: '3A-03', slot: 'Slot A-03', qty: 2, unit: 'เม็ด', round: 'รอบเช้า' }
            ]
        },
        'Omeprazole 20 mg': {
            code: 'DRG-00187', form: 'แคปซูล (Capsule)', route: 'PO', totalQty: 3, stock: 85,
            patients: [
                { name: 'สมชาย มานะ', bed: '3A-01', slot: 'Slot A-01', qty: 1, unit: 'แคปซูล', round: 'รอบเช้า' },
                { name: 'ประสิทธิ์ แก้วงาม', bed: '3A-12', slot: 'Slot B-04', qty: 1, unit: 'แคปซูล', round: 'รอบเที่ยง' },
                { name: 'สมศรี บุญมาก', bed: '3A-15', slot: 'Slot C-01', qty: 1, unit: 'แคปซูล', round: 'รอบเที่ยง' }
            ]
        },
        'Heparin 5000 units': {
            code: 'DRG-00891', form: 'ยาฉีด (Injection)', route: 'SC', totalQty: 2, stock: 15, highAlert: true,
            patients: [
                { name: 'สมชาย มานะ', bed: '3A-01', slot: 'Slot A-01', qty: 1, unit: 'vial', round: 'รอบเช้า' },
                { name: 'วิชัย ดีงาม', bed: '3A-05', slot: 'Slot A-05', qty: 1, unit: 'vial', round: 'รอบเช้า' }
            ]
        },
        'Aspirin 81 mg': {
            code: 'DRG-00045', form: 'เม็ด (Tablet)', route: 'PO', totalQty: 3, stock: 250,
            patients: [
                { name: 'วิชัย ดีงาม', bed: '3A-05', slot: 'Slot A-05', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'สมศรี บุญมาก', bed: '3A-15', slot: 'Slot C-01', qty: 1, unit: 'เม็ด', round: 'รอบเที่ยง' },
                { name: 'ธนกร วิเศษสิทธิ์', bed: '3A-10', slot: 'Slot B-02', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' }
            ]
        },
        'Atorvastatin 40 mg': {
            code: 'DRG-00678', form: 'เม็ด (Tablet)', route: 'PO', totalQty: 2, stock: 180,
            patients: [
                { name: 'พิมพ์ใจ สุขสม', bed: '3A-02', slot: 'Slot A-02', qty: 1, unit: 'เม็ด', round: 'ก่อนนอน' },
                { name: 'กัลยา ชัยวงศ์', bed: '3A-08', slot: 'Slot B-01', qty: 1, unit: 'เม็ด', round: 'ก่อนนอน' }
            ]
        },
        'Enalapril 10 mg': {
            code: 'DRG-00234', form: 'เม็ด (Tablet)', route: 'PO', totalQty: 2, stock: 95,
            patients: [
                { name: 'มาลี สุขใจ', bed: '3A-03', slot: 'Slot A-03', qty: 1, unit: 'เม็ด', round: 'รอบเช้า' },
                { name: 'สมศรี บุญมาก', bed: '3A-15', slot: 'Slot C-01', qty: 1, unit: 'เม็ด', round: 'รอบเที่ยง' }
            ]
        }
    };

    function normalizeIbfDrugName(name) {
        return String(name || '')
            .toLowerCase()
            .replace(/\bunits\b/g, 'u')
            .replace(/(\d+)\s*u\b/g, '$1u')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parseIbfQty(doseText) {
        const dose = String(doseText || '1 เม็ด').trim();
        const match = dose.match(/(\d+(?:\.\d+)?)/);
        const qty = match ? Number(match[1]) : 1;
        const unit = dose.replace(/^\d+(?:\.\d+)?\s*/, '').trim() || 'หน่วย';
        return { qty: Number.isFinite(qty) ? qty : 1, unit: unit };
    }

    function ibfSlotLabel(idx) {
        const zone = String.fromCharCode(65 + Math.floor(idx / 4));
        return 'Slot ' + zone + '-' + String((idx % 4) + 1).padStart(2, '0');
    }

    function getIbfStaticDrugData(drugName) {
        if (ibfDrugData[drugName]) return cloneWardData(ibfDrugData[drugName]);
        const target = normalizeIbfDrugName(drugName);
        const key = Object.keys(ibfDrugData).find(function(name) {
            return normalizeIbfDrugName(name) === target;
        });
        return key ? cloneWardData(ibfDrugData[key]) : null;
    }

    function remapIbfPatientsToCurrentWard(drug) {
        const keys = getDispensePatientKeys();
        const fallbackPatients = drug.patients || [];
        drug.patients = fallbackPatients.map(function(p, idx) {
            const pt = patientData[keys[idx % Math.max(keys.length, 1)]];
            return Object.assign({}, p, {
                name: pt ? pt.name : p.name,
                hn: pt ? pt.hn : p.hn,
                bed: pt ? pt.bed : p.bed,
                slot: ibfSlotLabel(idx),
                round: pt ? pt.round : p.round,
                avatar: pt ? pt.avatar : patientInitials(p.name)
            });
        });
        return drug;
    }

    function getIbfDrugData(drugName) {
        const fallback = getIbfStaticDrugData(drugName) || {
            code: 'DRG-DYN',
            form: 'ตามใบสั่งยา',
            route: 'PO',
            totalQty: 0,
            stock: 0,
            patients: []
        };
        const target = normalizeIbfDrugName(drugName);
        const matches = [];
        getDispensePatientKeys().forEach(function(key) {
            const pt = patientData[key];
            if (!pt) return;
            (pt.drugs || []).forEach(function(drug, idx) {
                const view = legacyDrugView(drug, pt, idx);
                if (view.done || normalizeIbfDrugName(view.name) !== target) return;
                const qtyInfo = parseIbfQty(view.dose);
                const interactionProfile = getIbfPatientInteractionProfile({ key: key, hn: pt.hn, bed: pt.bed, name: pt.name }, view.name);
                matches.push({
                    key: key,
                    drugIdx: idx,
                    name: pt.name,
                    hn: pt.hn,
                    bed: pt.bed,
                    avatar: pt.avatar || patientInitials(pt.name),
                    slot: ibfSlotLabel(matches.length),
                    qty: qtyInfo.qty,
                    unit: qtyInfo.unit,
                    round: view.freq || pt.round || 'รอบเช้า',
                    route: view.routeShort,
                    highAlert: view.highAlert,
                    interactionSeverity: interactionProfile.found ? interactionProfile.severity : null,
                    interactionDrug: interactionProfile.found ? interactionProfile.drug2 : '',
                    interactionDesc: interactionProfile.found ? interactionProfile.desc : ''
                });
            });
        });
        if (!matches.length) {
            return remapIbfPatientsToCurrentWard(fallback);
        }
        const totalQty = matches.reduce(function(sum, p) { return sum + (Number(p.qty) || 0); }, 0);
        return Object.assign({}, fallback, {
            route: matches[0].route || fallback.route,
            totalQty: totalQty,
            patients: matches,
            highAlert: matches.some(function(p) { return p.highAlert; }) || fallback.highAlert
        });
    }

    function getIbfPatientSource(patient) {
        if (!patient) return null;
        if (patient.key && patientData[patient.key]) return patientData[patient.key];
        const targetBed = String(patient.bed || '').toLowerCase();
        const targetHn = String(patient.hn || '').toLowerCase();
        const targetName = String(patient.name || '').toLowerCase();
        return Object.keys(patientData).map(function(key) {
            return patientData[key];
        }).find(function(pt) {
            return String(pt.bed || '').toLowerCase() === targetBed
                || String(pt.hn || '').toLowerCase() === targetHn
                || String(pt.name || '').toLowerCase() === targetName;
        }) || null;
    }

    function getIbfPatientInteractionProfile(patient, drugName) {
        const pt = getIbfPatientSource(patient);
        if (!pt || !pt.drugs) return { found: false };
        const target = normalizeIbfDrugName(drugName);
        const otherDrugs = pt.drugs
            .map(function(d) { return legacyDrugView(d, pt, 0); })
            .filter(function(view) { return normalizeIbfDrugName(view.name) !== target; })
            .map(function(view) { return view.name; });
        return getDrugInteractionProfile(drugName, otherDrugs);
    }

    function ibfPatientInteractionBadge(patient) {
        if (!patient || !patient.interactionSeverity) return '';
        const cfg = getInteractionSeverityConfig(patient.interactionSeverity);
        const title = 'Interaction กับ ' + (patient.interactionDrug || 'ยาอื่นใน profile');
        return '<span style="display:inline-flex;align-items:center;gap:4px;background:' + cfg.panelBg + ';color:' + cfg.actionColor + ';border:1px solid ' + cfg.panelBorder + ';font-size:9px;font-weight:850;padding:2px 7px;border-radius:999px;white-space:nowrap;" title="' + escHtml(title) + '">' + cfg.level + ' Interaction</span>';
    }

    function getIbfPatientInteraction(scanIdx) {
        const drug = getIbfDrugData(ibfDrugName);
        const patient = drug && drug.patients ? drug.patients[scanIdx] : null;
        return getIbfPatientInteractionProfile(patient, ibfDrugName);
    }

    function ibfContinueScanAfterInteraction(scanIdx) {
        if (isHighAlertDrug(ibfDrugName)) {
            var lotHA3 = drugLotMap[ibfDrugName] || { lot:'N/A' };
            showHAVerifyModal(ibfDrugName, lotHA3.lot, function() {
                ibfMarkOneScanned(scanIdx);
                showToast('พยานยืนยัน High Alert สำเร็จ — ' + ibfDrugName);
                setTimeout(function(){ showToast(''); }, 2000);
            }, "prep");
            return;
        }
        ibfMarkOneScanned(scanIdx);
    }

    function mdDrawerSlotHtml(num) {
        return '<div class="ptd-drawer-slot" onclick="ptdSelectDrawer(this,' + num + ')">'
            + '<div class="ptd-drawer-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="10" y1="10" x2="10" y2="20"/></svg></div>'
            + '<div class="ptd-drawer-num">' + num + '</div>'
            + '<div class="ptd-drawer-label">ชั้น ' + num + '</div>'
            + '</div>';
    }

    function mdCassSlotHtml(num, opts) {
        opts = opts || {};
        if (opts.maintenance) {
            return '<div class="ptd-cass-slot maintenance">'
                + '<div class="ptd-cass-num">' + num + '</div>'
                + '<div class="ptd-cass-status">ไม่พร้อมใช้</div>'
                + '</div>';
        }
        if (opts.completed) {
            return '<div class="ptd-cass-slot occupied">'
                + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" style="position:absolute;top:8px;right:8px;"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
                + '<div class="ptd-cass-num">' + num + '</div>'
                + '<div class="ptd-cass-status">เติมแล้ว</div>'
                + '</div>';
        }
        return '<div class="ptd-cass-slot" onclick="ptdSelectCass(this,' + num + ')">'
            + '<div class="ptd-cass-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
            + '<div class="ptd-cass-num">' + num + '</div>'
            + '<div class="ptd-cass-status">พร้อมเติมยา</div>'
            + '</div>';
    }

    function renderPrepCassetteGrid(page, drawerNum) {
        if (!page) return;
        const grid = page.querySelector('.ptd-cass-grid');
        if (!grid) return;
        const state = getDashboardCassetteState();
        const drawer = Math.min(Math.max(parseInt(drawerNum, 10) || 1, 1), state.drawers);
        const completedByKey = {};
        state.completedLocks.forEach(function(lock) {
            completedByKey[ptdCassetteKey(lock.drawer, lock.cassette)] = true;
        });
        const cassPD = dashCassetteCountForDrawer(drawer, state.drawers, state.total);
        grid.style.gridTemplateColumns = 'repeat(' + Math.max(Math.min(cassPD, STANDARD_CART_CASSETTES_PER_DRAWER), 1) + ', 1fr)';
        let html = '';
        for (let c = 1; c <= cassPD; c++) {
            const globalIndex = dashCassetteGlobalIndex(drawer, c, state.drawers, state.total);
            html += mdCassSlotHtml(c, {
                maintenance: globalIndex > state.readyBase,
                completed: !!completedByKey[ptdCassetteKey(drawer, c)]
            });
        }
        grid.innerHTML = html;
        ptdSyncCassetteModeUI(page, drawer);
    }

    function renderPrepHardwareFromDashboard(pageId) {
        const page = document.getElementById(pageId);
        const ids = hwPageMap[pageId] || null;
        if (!page || !ids) return;
        const state = getDashboardCassetteState();
        const cart = state.cart || {};
        const drawerRow = page.querySelector('.ptd-drawer-row');
        const cassArea = ids.cassArea ? document.getElementById(ids.cassArea) : page.querySelector('.ptd-cass-area');
        const cassTitle = page.querySelector('.ptd-cass-title span');

        ptdSelectedDrawer = 0;
        ptdSelectedCass = 0;
        ptdSelectedMode = null;
        if (drawerRow) {
            drawerRow.style.gridTemplateColumns = 'repeat(' + Math.max(Math.min(state.drawers, 8), 1) + ', 1fr)';
            drawerRow.innerHTML = Array.from({ length: state.drawers }, function(_, idx) {
                return mdDrawerSlotHtml(idx + 1);
            }).join('');
        }
        if (cassArea) cassArea.classList.add('disabled');
        if (cassTitle) cassTitle.textContent = 'Step 2 — เลือก Cassette (' + state.total + ' ช่องทั้งหมด)';
        renderPrepCassetteGrid(page, 1);
        if (ids.summary) {
            const summary = document.getElementById(ids.summary);
            if (summary) summary.style.display = 'none';
        }
        ptdSetHardwareStatus(ids, cart.name + ' · ' + (currentWardName || cart.ward) + ' · ' + state.drawers + '/' + state.total + ' Drawer/Cassette', '#DBEAFE', '#2563EB');
        ptdSetStartEnabled(page, ids, false);
    }
    setTimeout(function() {
        const activePage = document.querySelector('.page.active');
        if (activePage && prepHardwareReady && prepHardwarePages.includes(activePage.id)) {
            renderPrepHardwareFromDashboard(activePage.id);
        }
    }, 0);

    function renderMedDetailCassetteGrid(drawerNum) {
        const page = document.getElementById('pg-prep-med-detail');
        renderPrepCassetteGrid(page, drawerNum);
    }

    function renderMedDetailHardwareFromDashboard() {
        const page = document.getElementById('pg-prep-med-detail');
        const drawerRow = document.getElementById('mdDrawerRow');
        const cassArea = document.getElementById('mdCassArea');
        const cassTitle = document.getElementById('mdCassTitle');
        if (!page || !drawerRow) return;
        const state = getDashboardCassetteState();
        const cart = state.cart || {};
        ptdSelectedDrawer = 0;
        ptdSelectedCass = 0;
        ptdSelectedMode = null;
        drawerRow.style.gridTemplateColumns = 'repeat(' + Math.max(Math.min(state.drawers, 8), 1) + ', 1fr)';
        drawerRow.innerHTML = Array.from({ length: state.drawers }, function(_, idx) {
            return mdDrawerSlotHtml(idx + 1);
        }).join('');
        if (cassArea) cassArea.classList.add('disabled');
        if (cassTitle) cassTitle.textContent = 'Step 2 — เลือก Cassette (' + state.total + ' ช่องทั้งหมด)';
        ptdSetHardwareStatus(hwPageMap['pg-prep-med-detail'], cart.name + ' · ' + (currentWardName || cart.ward) + ' · ' + state.drawers + '/' + state.total + ' Drawer/Cassette', '#DBEAFE', '#2563EB');
        ptdSetStartEnabled(page, hwPageMap['pg-prep-med-detail'], false);
        const summary = document.getElementById('mdSelSummary');
        if (summary) summary.style.display = 'none';
        let context = document.getElementById('mdWardCartMeta');
        const meta = page.querySelector('.ptd-meta');
        if (!context && meta) {
            context = document.createElement('span');
            context.id = 'mdWardCartMeta';
            context.className = 'ptd-meta-item';
            meta.appendChild(context);
        }
        if (context) {
            context.textContent = (currentWardName || cart.ward || DEFAULT_DEMO_WARD) + ' · ' + (cart.name || 'Med Cart A-1') + ' · ' + state.available + '/' + state.total + ' ช่องพร้อมใช้';
        }
        renderMedDetailCassetteGrid(1);
    }

    function ibfPopulate() {
        ptdCommitCassetteLock('medication', buildMedicationCassetteLockMeta());
        const drug = getIbfDrugData(ibfDrugName);
        if (!drug) return;
        ibfActiveIdx = 0;
        ibfDoneCount = 0;
        ibfScannedSet.clear();
        ibfTotalQty = drug.totalQty;
        ibfDrugCode = drug.code;
        ibfQtys = drug.patients.map(p => p.qty);
        ibfTargetRefs = drug.patients.map(function(p) {
            return { key: p.key, drugIdx: p.drugIdx, hn: p.hn, bed: p.bed, name: p.name, slot: p.slot };
        });

        // Drug bar
        document.querySelector('.ibf-drug-name').innerHTML = ibfDrugName + haBadge(ibfDrugName);
        document.querySelector('.ibf-drug-code').innerHTML = drug.code + ' &nbsp;·&nbsp; ' + drug.form + ' &nbsp;·&nbsp; ' + drug.route;
        document.querySelector('.ibf-ds-num.total').textContent = ibfTotalQty;
        document.getElementById('ibfDone').textContent = '0';
        document.getElementById('ibfLeft').textContent = ibfTotalQty;

        // Dest list
        const scroll = document.getElementById('ibfDestScroll');
        scroll.innerHTML = drug.patients.map((p, i) => {
            const activeClass = i === 0 ? ' active' : '';
            const checkStroke = i === 0 ? '#2563EB' : 'white';
            const checkBorder = i === 0 ? 'border-color:#2563EB;background:rgba(37,99,235,0.08);' : '';
            const interactionCfg = p.interactionSeverity ? getInteractionSeverityConfig(p.interactionSeverity) : null;
            const interactionStyle = interactionCfg ? 'border-left:4px solid ' + interactionCfg.color + ';background:' + interactionCfg.panelBg + ';' : '';
            return '<div class="pf-drug-item' + activeClass + '" onclick="ibfSelect(this,' + i + ')" style="' + interactionStyle + '">'
                + '<div class="pf-drug-check" style="' + checkBorder + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="' + checkStroke + '" stroke-width="3" style="opacity:0;"><path d="M20 6L9 17l-5-5"/></svg></div>'
                + '<div style="flex:1;min-width:0;"><div class="pf-drug-name" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + p.name + ibfPatientInteractionBadge(p) + '</div><div class="pf-drug-sub">' + p.bed + ' · ' + p.slot + ' · ' + p.round + (p.interactionDrug ? ' · ชนกับ ' + escHtml(p.interactionDrug) : '') + '</div></div>'
                + '<div class="pf-drug-qty" style="color:#2563EB;">' + p.qty + ' ' + p.unit + '</div>'
                + '</div>';
        }).join('');

        // Dest head
        const interactionPatientCount = drug.patients.filter(function(p) { return !!p.interactionSeverity; }).length;
        document.querySelector('.ibf-dest-head').innerHTML = '<span class="ibf-dest-title">ข้อมูลคนไข้ปลายทาง</span>'
            + '<span class="ibf-dest-pill">' + drug.patients.length + ' ราย</span>'
            + (interactionPatientCount ? '<span class="ibf-dest-pill warn">Interaction ' + interactionPatientCount + ' ราย</span>' : '');

        // Reset summary button
        const sumBtn = document.getElementById('ibfBtnSummary');
        if (sumBtn) { sumBtn.disabled = true; sumBtn.style.opacity = '0.4'; sumBtn.style.cursor = 'not-allowed'; }

        // Reset scan
        document.getElementById("ibfScanResult").style.display="none";document.getElementById("ibfBtnConfirm").disabled=true;document.getElementById("ibfBtnConfirm").style.opacity="0.4";document.getElementById("ibfBtnConfirm").style.cursor="not-allowed";
    }

    function ibfPopulateMedDetail() {
        const drug = getIbfDrugData(ibfDrugName);
        if (!drug) return;
        const page = document.getElementById('pg-prep-med-detail');
        renderMedDetailHardwareFromDashboard();
        // Banner: drug name
        const nameEl = page.querySelector('.ptd-name');
        if (nameEl) nameEl.innerHTML = escHtml(ibfDrugName) + ' ' + ibfItemBadge() + haBadge(ibfDrugName);
        // Banner: meta pills
        const metaItems = page.querySelectorAll('.ptd-meta-item');
        if (metaItems[0]) metaItems[0].innerHTML = '<span style="color:#2563EB;font-weight:600;">' + drug.code + '</span>';
        if (metaItems[1]) metaItems[1].textContent = drug.form;
        if (metaItems[2]) metaItems[2].textContent = drug.route + ' · ' + ibfDrugName.split(' ').pop();
        // Banner: stats
        const statDivs = page.querySelectorAll('.ptd-patient-card > div:not(.ptd-avatar):not(.ptd-info):not(.ptd-badge)');
        // Use a more reliable approach
        const statsContainer = page.querySelector('.ptd-patient-card');
        if (statsContainer) {
            const statBoxes = statsContainer.querySelectorAll('[style*="border-radius:14px"][style*="text-align:center"]');
            if (statBoxes[0]) statBoxes[0].querySelector('div:first-child').textContent = drug.totalQty;
            if (statBoxes[1]) statBoxes[1].querySelector('div:first-child').textContent = drug.patients.length;
            if (statBoxes[2]) statBoxes[2].querySelector('div:first-child').textContent = drug.stock;
        }
        // Patient sidebar
        const sidebar = page.querySelector('.ptd-drugs-scroll');
        if (sidebar) {
            const colors = ['#0D9488','#7C3AED','#D97706','#DB2777','#2563EB','#EF4444'];
            sidebar.innerHTML = drug.patients.map((p, i) => {
                const c = colors[i % colors.length];
                const initials = p.name.substring(0,2);
                const interactionCfg = p.interactionSeverity ? getInteractionSeverityConfig(p.interactionSeverity) : null;
                const rowBg = interactionCfg ? interactionCfg.panelBg : 'rgba(255,255,255,0.72)';
                const rowBorder = interactionCfg ? interactionCfg.panelBorder : 'rgba(0,0,0,0.06)';
                const rowAccent = interactionCfg ? interactionCfg.color : c;
                return '<div style="background:' + rowBg + ';border:1px solid ' + rowBorder + ';border-left:3px solid ' + rowAccent + ';border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
                    + '<div style="width:32px;height:32px;background:linear-gradient(135deg,' + c + ',' + c + '99);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:700;color:white;">' + initials + '</div>'
                    + '<div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + p.name + ibfPatientInteractionBadge(p) + '</div><div style="font-size:10px;color:var(--text-3);margin-top:1px;">' + p.bed + ' · ' + p.qty + ' ' + p.unit + ' · ' + p.round + (p.interactionDrug ? ' · ชนกับ ' + escHtml(p.interactionDrug) : '') + '</div></div>'
                    + '<span style="padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;background:' + (interactionCfg ? interactionCfg.panelBg : '#FEF3C7') + ';color:' + (interactionCfg ? interactionCfg.actionColor : '#92400E') + ';border:1px solid ' + (interactionCfg ? interactionCfg.panelBorder : '#FDE68A') + ';">' + (interactionCfg ? 'เฝ้าระวัง' : 'รอจัด') + '</span>'
                    + '</div>';
            }).join('');
        }
        // Patient count in header
        const countEl = page.querySelector('.ptd-drugs-title span');
        if (countEl) countEl.textContent = 'ผู้ป่วย (' + drug.patients.length + ' ราย)';
    }

    let ibfScannedSet = new Set();

    function ibfSelect(el, idx) {
        ibfActiveIdx = idx;
        document.querySelectorAll('#ibfDestScroll .pf-drug-item').forEach(d => d.classList.remove('active'));
        if (!el.classList.contains('done') && !el.classList.contains('scanned')) el.classList.add('active');
    }

    function ibfScan() {
        const drug = getIbfDrugData(ibfDrugName);
        const items = document.querySelectorAll('#ibfDestScroll .pf-drug-item');
        // Use active item or find next available
        let scanIdx = ibfActiveIdx;
        if (items[scanIdx] && (items[scanIdx].classList.contains('done') || items[scanIdx].classList.contains('scanned'))) {
            scanIdx = -1;
            for (let i = 0; i < items.length; i++) {
                if (!items[i].classList.contains('done') && !items[i].classList.contains('scanned')) { scanIdx = i; break; }
            }
        }
        if (scanIdx === -1) { showToast('สแกนข้อมูลคนไข้ครบทุกคนแล้ว'); setTimeout(() => showToast(''), 1500); return; }

        // Item-based checks the selected drug against other active meds for the scanned patient.
        const interaction = getIbfPatientInteraction(scanIdx);
        if (interaction.found) {
            var _ibfScanIdx = scanIdx;
            showInteractionModal(interaction, function() {
                ibfContinueScanAfterInteraction(_ibfScanIdx);
            });
            return;
        }

        // If High Alert drug — require witness scan
        ibfContinueScanAfterInteraction(scanIdx);
    }
    function ibfMarkOneScanned(scanIdx) {
        var drug = getIbfDrugData(ibfDrugName);
        var items = document.querySelectorAll('#ibfDestScroll .pf-drug-item');
        // Mark as scanned
        ibfScannedSet.add(scanIdx);
        items[scanIdx].classList.remove('active');
        items[scanIdx].classList.add('scanned');
        items[scanIdx].style.borderColor = '#3B82F6';
        items[scanIdx].style.background = 'linear-gradient(135deg,#EFF6FF,#DBEAFE)';
        items[scanIdx].querySelector('.pf-drug-check').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
        items[scanIdx].querySelector('.pf-drug-check').style.borderColor = '#3B82F6';
        items[scanIdx].querySelector('.pf-drug-check').style.background = 'rgba(59,130,246,0.08)';

        // Update scan result list
        ibfUpdateScanList();

        // Enable confirm
        document.getElementById('ibfBtnConfirm').disabled = false;
        document.getElementById('ibfBtnConfirm').style.opacity = '1';
        document.getElementById('ibfBtnConfirm').style.cursor = 'pointer';

        const patient = drug ? drug.patients[scanIdx] : null;
        showToast('สแกนข้อมูลคนไข้ ' + (patient ? patient.name : '') + ' เพื่อจัด ' + ibfDrugName + ' ลงช่อง (' + ibfScannedSet.size + '/' + (drug ? drug.patients.length : '?') + ')');
        setTimeout(() => showToast(''), 1500);
    }

    function ibfUpdateScanList() {
        const drug = getIbfDrugData(ibfDrugName);
        const lotInfo = drugLotMap[ibfDrugName] || { lot:'N/A', exp:'N/A' };
        const container = document.getElementById('ibfScanResult');
        if (ibfScannedSet.size === 0) { container.style.display = 'none'; return; }
        container.style.display = '';
        let html = '<div class="pf-result-head" style="background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border-bottom-color:rgba(59,130,246,0.1);">'
            + '<span class="pf-result-badge" style="background:linear-gradient(135deg,#DBEAFE,#BFDBFE);color:#2563EB;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> สแกนข้อมูลคนไข้แล้ว ' + ibfScannedSet.size + ' ราย</span>'
            + '<span class="pf-result-name">พร้อมยืนยันจัดยาลงช่อง</span></div>';
        html += '<div style="padding:12px 16px;display:flex;flex-direction:column;gap:6px;">';
        ibfScannedSet.forEach(idx => {
            const p = drug ? drug.patients[idx] : null;
            html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:1px solid rgba(59,130,246,0.12);border-radius:10px;">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
                + '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text-1);">' + (p ? p.name : '') + '</div>'
                + '<div style="font-size:10px;color:var(--text-3);">' + (p ? p.bed + ' · ' + p.slot + ' · ' + p.qty + ' ' + p.unit : '') + ' · Lot: ' + lotInfo.lot + '</div></div>'
                + '<span style="font-size:10px;font-weight:700;color:#2563EB;">คนไข้ตรงกัน</span>'
                + '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function ibfConfirm() {
        const items = document.querySelectorAll('#ibfDestScroll .pf-drug-item');
        ibfScannedSet.forEach(idx => {
            const item = items[idx];
            if (item && !item.classList.contains('done')) {
                item.classList.remove('scanned');
                item.classList.add('done');
                item.style.borderColor = 'transparent';
                item.style.background = '';
                item.querySelector('.pf-drug-check').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                item.querySelector('.pf-drug-check').style.borderColor = '#2563EB';
                item.querySelector('.pf-drug-check').style.background = '#2563EB';
                ibfDoneCount += ibfQtys[idx] || 1;
            }
        });
        document.getElementById('ibfDone').textContent = ibfDoneCount;
        document.getElementById('ibfLeft').textContent = ibfTotalQty - ibfDoneCount;
        ibfScannedSet.clear();
        document.getElementById('ibfScanResult').style.display = 'none';
        document.getElementById('ibfBtnConfirm').disabled = true;
        document.getElementById('ibfBtnConfirm').style.opacity = '0.4';
        document.getElementById('ibfBtnConfirm').style.cursor = 'not-allowed';
        ptdCommitCassetteLock('medication', buildMedicationCassetteLockMeta());

        // Enable summary if at least 1 done
        if (ibfDoneCount > 0) {
            const sumBtn = document.getElementById('ibfBtnSummary');
            sumBtn.disabled = false; sumBtn.style.opacity = '1'; sumBtn.style.cursor = 'pointer';
        }
        if (ibfDoneCount >= ibfTotalQty) {
            markCurrentCassetteFilled();
            showToast('จัดยาครบทุกคนไข้ปลายทางแล้ว — ไปหน้าสรุปผลได้');
        } else {
            showToast('ยืนยัน ' + ibfDoneCount + '/' + ibfTotalQty + ' — สแกนข้อมูลคนไข้ถัดไปได้เลย');
        }
        setTimeout(() => showToast(''), 2000);
    }

    function ibfPopulateSummary() {
        setSummaryFlow({ mode: 'medication', editPage: 'pg-ibf', continuePage: 'pg-prep-med' });
        const drug = getIbfDrugData(ibfDrugName);
        if (!drug) return;
        const patients = drug.patients;
        const total = patients.length;
        const items = document.querySelectorAll('#ibfDestScroll .pf-drug-item');
        const doneFlags = [];
        items.forEach(function(item) { doneFlags.push(item.classList.contains('done')); });
        const doneCount = doneFlags.filter(Boolean).length;
        const notDone = total - doneCount;
        const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
        const lotInfo = drugLotMap[ibfDrugName] || { lot:'N/A', exp:'N/A' };

        document.getElementById('sumContext').innerHTML =
            '<span class="fill-ctx-chip">ยา: <strong>' + ibfDrugName + '</strong></span>'
            + '<span class="fill-ctx-chip">รหัส: <strong>' + drug.code + '</strong></span>'
            + '<span class="fill-ctx-chip">' + drug.form + ' · <strong>' + drug.route + '</strong></span>'
            + '<span class="fill-ctx-chip">ชั้น / Cassette: <strong>' + ptdSelectedDrawer + ' / ' + ptdSelectedCass + '</strong></span>'
            + '<span class="fill-ctx-chip">ประเภท: <strong>ตามข้อมูลคนไข้ปลายทาง</strong></span>';

        document.getElementById('sumStats').innerHTML =
            '<div class="ss"><div class="ss-num blue">' + total + '</div><div class="ss-label">คนไข้ปลายทาง</div></div>'
            + '<div class="ss"><div class="ss-num green">' + doneCount + '</div><div class="ss-label">จัดครบแล้ว</div></div>'
            + '<div class="ss"><div class="ss-num amber">' + notDone + '</div><div class="ss-label">ยังไม่จัด</div></div>'
            + '<div class="ss"><div class="ss-num red">0</div><div class="ss-label">มีปัญหา</div></div>';

        document.getElementById('sumProgress').innerHTML =
            '<div class="sp-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
            + '<div class="sp-bar-wrap"><div class="sp-label-row"><span class="sp-label">ความคืบหน้า</span><span class="sp-pct">' + pct + '%</span></div><div class="sp-track"><div class="sp-fill" style="width:' + pct + '%"></div></div></div>';

        var tableHtml = '<div class="sum-table-head"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> จัดยา ' + ibfDrugName + ' — รายคนไข้</div>';
        tableHtml += '<div class="st-row header-row"><div>ผู้ป่วย</div><div style="text-align:center">จำนวน</div><div style="text-align:center">Lot / Expiry</div><div style="text-align:center">Slot</div><div style="text-align:center">สถานะ</div></div>';
        patients.forEach(function(p, i) {
            var isDone = doneFlags[i] || false;
            var interactionWarn = p.interactionSeverity
                ? '<div class="st-sub" style="color:' + getInteractionSeverityConfig(p.interactionSeverity).actionColor + ';font-weight:700;">Interaction กับ ' + escHtml(p.interactionDrug || 'ยาอื่น') + '</div>'
                : '';
            var statusHtml = isDone
                ? '<span class="st-status ok"><span class="dot"></span> สำเร็จ</span>'
                : '<span class="st-status warn">ยังไม่จัด</span>';
            var rowBg = isDone ? '' : ' style="background:#fffbeb;"';
            tableHtml += '<div class="st-row"' + rowBg + '>'
                + '<div><div class="st-name" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + p.name + ibfPatientInteractionBadge(p) + '</div><div class="st-sub">เตียง ' + p.bed + ' · ' + p.round + '</div>' + interactionWarn + '</div>'
                + '<div class="st-val">' + p.qty + ' ' + p.unit + '</div>'
                + '<div class="st-val">' + (isDone ? lotInfo.lot + ' · ' + lotInfo.exp : '—') + '</div>'
                + '<div class="st-val">' + p.slot + '</div>'
                + '<div style="text-align:center">' + statusHtml + '</div>'
                + '</div>';
        });
        document.getElementById('sumTable').innerHTML = tableHtml;
        nav('pg-summary');
    }

    /* ── Prep by medication search (Page 28) ── */
    function filterPbm() {
        const q = document.getElementById('pbmSearch').value.trim().toLowerCase();
        const activeFilter = document.querySelector('#pg-prep-med .filter-btn.active');
        const filterText = activeFilter ? activeFilter.textContent.trim() : 'ทั้งหมด';
        document.querySelectorAll('#pbmList .pbm-card').forEach(c => {
            const name = (c.dataset.name || '').toLowerCase();
            const code = (c.dataset.code || '').toLowerCase();
            const status = c.dataset.status || '';
            const matchSearch = !q || name.includes(q) || code.includes(q);
            const matchFilter = filterText.includes('Interaction')
                ? c.dataset.interaction === 'true'
                : filterText.includes('ยังไม่จัด') ? status !== 'done' : filterText.includes('จัดครบ') ? status === 'done' : true;
            c.style.display = (matchSearch && matchFilter) ? '' : 'none';
        });
    }

    /* ── Prep fill by patient (Page 27) ── */
    let pfDoneCount = 0;
    let pfDrugNames = [];
    let pfDrugLots = [];
    let pfDrugExp = [];
    let pfDrugQty = [];
    let pfTotalDrugs = 0;
    let pfDrugIsHA = [];
    let pfDrugIndexes = [];
    let pfPendingHAIdx = -1;
    let pfActiveIdx = 0;
    let pfScannedSet = new Set();

    const drugLotMap = {
        'Amlodipine 5 mg': { lot:'AML-2025-108', exp:'03/2570' },
        'Amlodipine 10 mg': { lot:'AML-2025-110', exp:'03/2570' },
        'Metformin 500 mg': { lot:'MET-2025-042', exp:'06/2570' },
        'Omeprazole 20 mg': { lot:'OME-2025-215', exp:'09/2570' },
        'Heparin 5000u': { lot:'HEP-2025-089', exp:'12/2570' },
        'Heparin 5000 units': { lot:'HEP-2025-089', exp:'12/2570' },
        'Aspirin 81 mg': { lot:'ASP-2025-077', exp:'08/2570' },
        'Atorvastatin 40 mg': { lot:'ATO-2025-039', exp:'06/2570' },
        'Enalapril 10 mg': { lot:'ENA-2025-044', exp:'07/2570' },
        'Losartan 50 mg': { lot:'LOS-2025-067', exp:'08/2570' },
        'Simvastatin 20 mg': { lot:'SIM-2025-031', exp:'05/2570' },
        'Enalapril 5 mg': { lot:'ENA-2025-044', exp:'07/2570' },
        'Furosemide 40 mg': { lot:'FUR-2025-018', exp:'04/2570' },
        'Warfarin 3 mg': { lot:'WAR-2025-055', exp:'10/2570' },
        'Glipizide 5 mg': { lot:'GLI-2025-072', exp:'11/2570' },
        'Atorvastatin 20 mg': { lot:'ATO-2025-039', exp:'06/2570' },
        'Paracetamol 500 mg': { lot:'PAR-2025-101', exp:'02/2571' },
        'Amoxicillin 500 mg': { lot:'AMX-2025-088', exp:'01/2571' },
        'Insulin Glargine 20u': { lot:'INS-2025-014', exp:'09/2570' },
        'Hydrochlorothiazide 25 mg': { lot:'HCT-2025-026', exp:'07/2570' },
        'Cefazolin 1 g': { lot:'CFZ-2026-015', exp:'01/2571' },
        'Enoxaparin 40 mg': { lot:'ENO-2026-022', exp:'04/2571' },
        'Celecoxib 200 mg': { lot:'CEL-2026-034', exp:'03/2571' },
        'Tramadol 50 mg': { lot:'TRM-2026-017', exp:'08/2570' },
        'Calcium Carbonate 600 mg': { lot:'CAL-2026-046', exp:'12/2571' },
        'Vitamin D3 1000 IU': { lot:'VTD-2026-011', exp:'11/2571' },
        'Morphine 5 mg': { lot:'MOR-2026-009', exp:'06/2570' },
        'Gabapentin 300 mg': { lot:'GAB-2026-028', exp:'10/2571' },
        'Docusate 100 mg': { lot:'DOC-2026-019', exp:'09/2571' }
    };

    /* ── Drug Interaction Check ── */
    const drugInteractions = [
        { drugs: ['Warfarin', 'Paracetamol'], severity: 'moderate', desc: 'Paracetamol เพิ่มฤทธิ์ต้านการแข็งตัวของเลือดของ Warfarin อาจทำให้เลือดออกง่าย ต้องติดตาม INR/อาการเลือดออก' },
        { drugs: ['Warfarin', 'Aspirin'], severity: 'major', desc: 'Aspirin เพิ่มความเสี่ยงเลือดออกอย่างรุนแรงเมื่อใช้ร่วมกับ Warfarin' },
        { drugs: ['Warfarin', 'Omeprazole'], severity: 'moderate', desc: 'Omeprazole อาจเพิ่มระดับ Warfarin ในเลือด ต้องติดตาม INR' },
        { drugs: ['Metformin', 'Insulin'], severity: 'moderate', desc: 'ใช้ร่วมกันอาจเพิ่มความเสี่ยงภาวะน้ำตาลในเลือดต่ำ (Hypoglycemia)' },
        { drugs: ['Amlodipine', 'Simvastatin'], severity: 'moderate', desc: 'Amlodipine เพิ่มระดับ Simvastatin อาจทำให้เกิดอาการปวดกล้ามเนื้อ (Rhabdomyolysis)' },
        { drugs: ['Enalapril', 'Losartan'], severity: 'major', desc: 'ห้ามใช้ ACE Inhibitor ร่วมกับ ARB เพิ่มความเสี่ยงไตวายและโพแทสเซียมสูง' },
        { drugs: ['Heparin', 'Aspirin'], severity: 'major', desc: 'เพิ่มความเสี่ยงเลือดออกรุนแรงเมื่อใช้ร่วมกัน' },
        { drugs: ['Aspirin', 'Omeprazole'], severity: 'minor', desc: 'พบการใช้ร่วมกันที่ควรบันทึกและติดตามอาการทาง GI ตามแผนการรักษา' },
        { drugs: ['Tramadol', 'Gabapentin'], severity: 'minor', desc: 'อาจเพิ่มอาการง่วงหรือเวียนศีรษะเล็กน้อย ควรติดตามอาการหลังให้ยา' }
    ];

    const interactionSeverityConfig = {
        minor: {
            level: 'ระดับ 1',
            label: 'MINOR — เฝ้าระวัง',
            color: '#2563EB',
            bg: 'linear-gradient(135deg,#2563EB,#3B82F6)',
            panelBg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
            panelBorder: '#BFDBFE',
            actionColor: '#1D4ED8',
            actionText: 'บันทึกการแจ้งเตือนและติดตามอาการตามแนวทาง สามารถดำเนินการต่อได้หลังรับทราบ'
        },
        moderate: {
            level: 'ระดับ 2',
            label: 'MODERATE — ต้องระวัง',
            color: '#D97706',
            bg: 'linear-gradient(135deg,#D97706,#F59E0B)',
            panelBg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
            panelBorder: '#FDE68A',
            actionColor: '#B45309',
            actionText: 'ควรระวังและติดตามอาการหรือผล Lab ที่เกี่ยวข้อง สามารถดำเนินการต่อได้หลังรับทราบ'
        },
        major: {
            level: 'ระดับ 3',
            label: 'MAJOR — รุนแรง',
            color: '#DC2626',
            bg: 'linear-gradient(135deg,#DC2626,#EF4444)',
            panelBg: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)',
            panelBorder: '#FECACA',
            actionColor: '#B91C1C',
            actionText: 'ยาคู่นี้มีปฏิกิริยารุนแรง กรุณาติดต่อแพทย์ผู้สั่งยาก่อนดำเนินการต่อ'
        }
    };

    function getInteractionSeverityConfig(severity) {
        return interactionSeverityConfig[severity] || interactionSeverityConfig.moderate;
    }

    function getInteractionSeverityRank(severity) {
        return { minor: 1, moderate: 2, major: 3 }[severity] || 0;
    }

    function normalizeInteractionDrugName(name) {
        return String(name || '')
            .replace(/\s*\d+(?:\.\d+)?\s*(mg|g|u|units|mcg|iu|ml)$/i, '')
            .trim()
            .toLowerCase();
    }

    function interactionNameMatches(name, base) {
        const normalizedName = normalizeInteractionDrugName(name);
        const normalizedBase = normalizeInteractionDrugName(base);
        if (!normalizedName || !normalizedBase) return false;
        return normalizedName === normalizedBase
            || normalizedName.includes(normalizedBase)
            || normalizedBase.includes(normalizedName);
    }

    function findDrugInteractionMatches(drugName, existingDrugs) {
        const matches = [];
        for (const pair of drugInteractions) {
            const matchedBase = pair.drugs.find(function(base) {
                return interactionNameMatches(drugName, base);
            });
            if (!matchedBase) continue;
            const otherBase = pair.drugs.find(function(base) {
                return base !== matchedBase;
            });
            for (const existing of (existingDrugs || [])) {
                if (interactionNameMatches(existing, otherBase)) {
                    matches.push({ found: true, drug1: drugName, drug2: existing, severity: pair.severity, desc: pair.desc });
                }
            }
        }
        return matches.sort(function(a, b) {
            return getInteractionSeverityRank(b.severity) - getInteractionSeverityRank(a.severity);
        });
    }

    function getDrugInteractionProfile(drugName, existingDrugs) {
        const matches = findDrugInteractionMatches(drugName, existingDrugs);
        if (!matches.length) return { found: false, matches: [] };
        return Object.assign({ matches: matches }, matches[0]);
    }

    function prepInteractionBadge(row) {
        if (!row || !row.interactionSeverity) return '';
        const cfg = getInteractionSeverityConfig(row.interactionSeverity);
        const pairCount = row.interactionPairs && row.interactionPairs.size ? ' · ' + row.interactionPairs.size + ' คู่' : '';
        return '<span class="pbm-interaction" style="background:' + cfg.panelBg + ';color:' + cfg.actionColor + ';border-color:' + cfg.panelBorder + ';">' + cfg.level + ' Interaction' + pairCount + '</span>';
    }

    function checkDrugInteraction(drugName, existingDrugs) {
        const matches = findDrugInteractionMatches(drugName, existingDrugs);
        if (matches.length) {
            return matches[0];
        }
        return { found: false };
    }

    var _interactionProceedCb = null;
    function showInteractionModal(info, proceedCallback) {
        _interactionProceedCb = proceedCallback || null;
        let modal = document.getElementById('drugInteractionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'drugInteractionModal';
            document.body.appendChild(modal);
        }
        const severityCfg = getInteractionSeverityConfig(info.severity);
        const sevColor = severityCfg.color;
        const sevBg = severityCfg.bg;
        const sevLabel = severityCfg.level + ' · ' + severityCfg.label;
        const actionText = severityCfg.actionText;
        const proceedBtnHtml = proceedCallback
            ? '<button onclick="_interactionProceedCb && _interactionProceedCb(); document.getElementById(\'drugInteractionModal\').style.display=\'none\';" style="width:100%;padding:14px;border:none;background:' + sevBg + ';color:white;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Prompt\',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);margin-bottom:10px;">'
              + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
              + 'รับทราบ — จัดยาต่อ'
              + '</button>'
            : '';
        modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);';
        modal.innerHTML = '<div style="background:white;border-radius:24px;width:100%;max-width:480px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.25);animation:fadeInUp .3s ease;">'
            + '<div style="background:' + sevBg + ';padding:28px;text-align:center;position:relative;overflow:hidden;">'
            + '<div style="position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);top:-40px;right:-20px;"></div>'
            + '<div style="width:68px;height:68px;background:rgba(255,255,255,0.18);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;backdrop-filter:blur(8px);">'
            + '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            + '</div>'
            + '<div style="font-size:22px;font-weight:800;color:white;">Drug Interaction</div>'
            + '<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">' + sevLabel + '</div>'
            + '</div>'
            + '<div style="padding:24px 28px;">'
            + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:16px;background:' + severityCfg.panelBg + ';border:1.5px solid ' + severityCfg.panelBorder + ';border-radius:16px;">'
            + '<div style="flex:1;text-align:center;"><div style="font-size:10px;color:' + sevColor + ';font-weight:600;margin-bottom:4px;">ยาที่สแกน</div><div style="font-size:15px;font-weight:800;color:var(--text-1);">' + info.drug1 + '</div></div>'
            + '<div style="width:36px;height:36px;background:' + sevBg + ';border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'
            + '<div style="flex:1;text-align:center;"><div style="font-size:10px;color:' + sevColor + ';font-weight:600;margin-bottom:4px;">ยาที่ interaction ด้วย</div><div style="font-size:15px;font-weight:800;color:var(--text-1);">' + info.drug2 + '</div></div>'
            + '</div>'
            + '<div style="font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:20px;padding:14px 16px;background:#F8FAFC;border-radius:12px;border-left:4px solid ' + sevColor + ';">'
            + '<strong style="color:var(--text-1);">คำอธิบาย:</strong> ' + info.desc
            + '</div>'
            + '<div style="background:' + severityCfg.panelBg + ';border:1.5px solid ' + severityCfg.panelBorder + ';border-radius:14px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px;">'
            + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + sevColor + '" stroke-width="2.5" style="flex-shrink:0;margin-top:1px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            + '<div style="font-size:12px;color:' + severityCfg.actionColor + ';line-height:1.5;">' + actionText + '</div>'
            + '</div>'
            + proceedBtnHtml
            + '<button onclick="document.getElementById(\'drugInteractionModal\').style.display=\'none\'" style="width:100%;padding:14px;border:none;background:linear-gradient(135deg,#64748B,#475569);color:white;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Prompt\',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(71,85,105,0.3);">'
            + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'
            + 'กลับไปทบทวน'
            + '</button>'
            + '</div></div>';
    }

    function pfPopulate() {
        ptdCommitCassetteLock('patient', buildPatientCassetteLockMeta());
        const pt = patientData[currentPatientBed];
        if (!pt) return;
        const pendingEntries = pt.drugs.map(function(drug, idx) {
            return { drug: drug, idx: idx };
        }).filter(function(entry) { return !entry.drug.done; });
        const pending = pendingEntries.map(function(entry) { return entry.drug; });
        pfTotalDrugs = pending.length;
        pfDoneCount = 0;
        pfActiveIdx = 0;
        pfScannedSet.clear();

        pfDrugNames = pending.map(d => d.name);
        pfDrugQty = pending.map(d => (d.desc || d.dose || d.name || '').split(' · ')[0]);
        pfDrugLots = pending.map(d => (drugLotMap[d.name] || {lot:'N/A'}).lot);
        pfDrugExp = pending.map(d => (drugLotMap[d.name] || {exp:'N/A'}).exp);
        pfDrugIsHA = pending.map(d => !!d.highAlert);
        pfDrugIndexes = pendingEntries.map(function(entry) { return entry.idx; });

        // Top bar
        document.querySelector('.pf-topbar-avatar').textContent = pt.avatar;
        document.querySelector('.pf-topbar-name').textContent = pt.name;
        document.querySelector('.pf-topbar-meta').innerHTML = '<span>HN: ' + pt.hn + '</span><span style="opacity:0.4;">·</span><span>เตียง ' + pt.bed + '</span>';
        document.getElementById('pfProgress').textContent = 'จัดแล้ว 0/' + pfTotalDrugs;

        // Drug list
        const scroll = document.getElementById('pfListScroll');
        scroll.innerHTML = pending.map((d, i) => {
            const isHA = haBadge(d.name);
            const activeClass = i === 0 ? ' active' : '';
            return '<div class="pf-drug-item' + activeClass + '" onclick="pfSelect(this,' + i + ')">'
                + '<div class="pf-drug-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="' + (i===0?'#0D9488':'white') + '" stroke-width="3" style="opacity:0;"><path d="M20 6L9 17l-5-5"/></svg></div>'
                + '<div style="flex:1;min-width:0;"><div class="pf-drug-name" style="display:flex;align-items:center;gap:6px;">' + d.name + isHA + '</div><div class="pf-drug-sub">' + (d.desc || d.dose || '') + '</div></div>'
                + '<div class="pf-drug-qty">' + pfDrugQty[i] + '</div>'
                + '</div>';
        }).join('');

        // Drug head count
        document.querySelector('.pf-drug-head').innerHTML = '<div class="pf-drug-head-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div> รายการยา (' + pfTotalDrugs + ') <span style="margin-left:auto;font-size:10px;color:var(--text-3);font-weight:500;">' + pt.round + '</span>';

        // Reset scan result & buttons
        document.getElementById('pfScanResult').style.display = 'none';
        document.getElementById('pfBtnConfirm').disabled = true;
        document.getElementById('pfBtnConfirm').style.opacity = '0.4';
        document.getElementById('pfBtnConfirm').style.cursor = 'not-allowed';
        const sumBtn = document.getElementById('pfBtnSummary');
        sumBtn.disabled = true; sumBtn.style.opacity = '0.4'; sumBtn.style.cursor = 'not-allowed';
    }

    function pfPopulateSummary() {
        setSummaryFlow({ mode: 'patient', editPage: 'pg-prep-fill-pt', continuePage: 'pg-prep-patient' });
        const pt = patientData[currentPatientBed];
        if (!pt) return;
        const pending = pt.drugs.filter(d => !d.done);
        const total = pending.length;
        const done = pfDoneCount;
        const notDone = total - done;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        // Check which items are done in the UI
        const items = document.querySelectorAll('#pfListScroll .pf-drug-item');
        const doneFlags = [];
        items.forEach(function(item) { doneFlags.push(item.classList.contains('done')); });

        // Context chips
        document.getElementById('sumContext').innerHTML =
            '<span class="fill-ctx-chip">ผู้ป่วย: <strong>' + pt.name + '</strong></span>'
            + '<span class="fill-ctx-chip">HN: <strong>' + pt.hn + '</strong></span>'
            + '<span class="fill-ctx-chip">เตียง: <strong>' + pt.bed + '</strong></span>'
            + '<span class="fill-ctx-chip">ชั้น / Cassette: <strong>' + ptdSelectedDrawer + ' / ' + ptdSelectedCass + '</strong></span>'
            + '<span class="fill-ctx-chip">ประเภท: <strong>ตามผู้ป่วย · ' + pt.round + '</strong></span>';

        // Stats
        document.getElementById('sumStats').innerHTML =
            '<div class="ss"><div class="ss-num blue">' + total + '</div><div class="ss-label">รายการทั้งหมด</div></div>'
            + '<div class="ss"><div class="ss-num green">' + done + '</div><div class="ss-label">จัดครบแล้ว</div></div>'
            + '<div class="ss"><div class="ss-num amber">' + notDone + '</div><div class="ss-label">ยังไม่จัด</div></div>'
            + '<div class="ss"><div class="ss-num red">0</div><div class="ss-label">มีปัญหา</div></div>';

        // Progress
        document.getElementById('sumProgress').innerHTML =
            '<div class="sp-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
            + '<div class="sp-bar-wrap"><div class="sp-label-row"><span class="sp-label">ความคืบหน้า</span><span class="sp-pct">' + pct + '%</span></div><div class="sp-track"><div class="sp-fill" style="width:' + pct + '%"></div></div></div>';

        // Table
        var tableHtml = '<div class="sum-table-head"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> รายการจัดยาทั้งหมด — ' + pt.name + '</div>';
        tableHtml += '<div class="st-row header-row"><div>ยา</div><div style="text-align:center">จำนวน</div><div style="text-align:center">Lot / Expiry</div><div style="text-align:center">รอบ</div><div style="text-align:center">สถานะ</div></div>';
        pending.forEach(function(d, i) {
            var lotInfo = drugLotMap[d.name] || { lot:'N/A', exp:'N/A' };
            var qty = (d.desc || d.dose || d.name || '').split(' · ')[0];
            var ha = haBadge(d.name);
            var isDone = doneFlags[i] || false;
            var statusHtml = isDone
                ? '<span class="st-status ok"><span class="dot"></span> สำเร็จ</span>'
                : '<span class="st-status warn">ยังไม่จัด</span>';
            var rowBg = isDone ? '' : ' style="background:#fffbeb;"';
            tableHtml += '<div class="st-row"' + rowBg + '>'
                + '<div><div class="st-name" style="display:flex;align-items:center;gap:6px;">' + d.name + ha + '</div><div class="st-sub">' + (d.desc || d.dose || '') + '</div></div>'
                + '<div class="st-val">' + qty + '</div>'
                + '<div class="st-val">' + (isDone ? lotInfo.lot + ' · ' + lotInfo.exp : '—') + '</div>'
                + '<div class="st-val">' + pt.round + '</div>'
                + '<div style="text-align:center">' + statusHtml + '</div>'
                + '</div>';
        });
        document.getElementById('sumTable').innerHTML = tableHtml;

        nav('pg-summary');
    }

    function pfSelect(el, idx) {
        pfActiveIdx = idx;
        document.querySelectorAll('#pfListScroll .pf-drug-item').forEach(i => i.classList.remove('active'));
        if (!el.classList.contains('done') && !el.classList.contains('scanned')) el.classList.add('active');
    }

    function pfScanDrug() {
        const items = document.querySelectorAll('#pfListScroll .pf-drug-item');
        // Use the selected item (pfActiveIdx), or find next available if selected is already done/scanned
        let scanIdx = pfActiveIdx;
        if (items[scanIdx] && (items[scanIdx].classList.contains('done') || items[scanIdx].classList.contains('scanned'))) {
            // selected item already done/scanned — find next available
            scanIdx = -1;
            for (let i = 0; i < items.length; i++) {
                if (!items[i].classList.contains('done') && !items[i].classList.contains('scanned')) {
                    scanIdx = i; break;
                }
            }
        }
        if (scanIdx === -1 || !items[scanIdx]) { showToast('สแกนครบทุกรายการแล้ว'); setTimeout(() => showToast(''), 1500); return; }

        // Check drug interaction with already scanned/done drugs only
        var alreadyInCassette = [];
        var pfItems = document.querySelectorAll('#pfListScroll .pf-drug-item');
        pfItems.forEach(function(item, i) {
            if ((item.classList.contains('done') || item.classList.contains('scanned')) && i !== scanIdx) {
                alreadyInCassette.push(pfDrugNames[i]);
            }
        });
        if (alreadyInCassette.length > 0) {
            var interaction = checkDrugInteraction(pfDrugNames[scanIdx], alreadyInCassette);
            if (interaction.found) {
                var _pfScanIdx = scanIdx;
                showInteractionModal(interaction, function() {
                    if (pfDrugIsHA[_pfScanIdx]) {
                        showHAVerifyModal(pfDrugNames[_pfScanIdx], pfDrugLots[_pfScanIdx], function() {
                            pfMarkScanned(_pfScanIdx);
                            showToast('ยืนยันพยาน High Alert สำเร็จ — ' + pfDrugNames[_pfScanIdx]);
                            setTimeout(function(){ showToast(''); }, 2000);
                        }, 'prep');
                    } else {
                        pfMarkScanned(_pfScanIdx);
                    }
                });
                return;
            }
        }

        // If HA drug, show verification modal first
        if (pfDrugIsHA[scanIdx]) {
            var _si = scanIdx;
            showHAVerifyModal(pfDrugNames[_si], pfDrugLots[_si], function() {
                pfMarkScanned(_si);
                showToast('ยืนยันพยาน High Alert สำเร็จ — ' + pfDrugNames[_si]);
                setTimeout(function(){ showToast(''); }, 2000);
            }, "prep");
            return;
        }

        // Normal drug — mark as scanned directly
        pfMarkScanned(scanIdx);
    }

    function pfMarkScanned(scanIdx) {
        const items = document.querySelectorAll('#pfListScroll .pf-drug-item');
        pfScannedSet.add(scanIdx);
        items[scanIdx].classList.remove('active');
        items[scanIdx].classList.add('scanned');
        items[scanIdx].style.borderColor = '#3B82F6';
        items[scanIdx].style.background = 'linear-gradient(135deg,#EFF6FF,#DBEAFE)';
        items[scanIdx].querySelector('.pf-drug-check').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
        items[scanIdx].querySelector('.pf-drug-check').style.borderColor = '#3B82F6';
        items[scanIdx].querySelector('.pf-drug-check').style.background = 'rgba(59,130,246,0.08)';

        // update scan result list
        pfUpdateScanList();

        // enable confirm
        document.getElementById('pfBtnConfirm').disabled = false;
        document.getElementById('pfBtnConfirm').style.opacity = '1';
        document.getElementById('pfBtnConfirm').style.cursor = 'pointer';

        showToast('สแกน ' + pfDrugNames[scanIdx] + ' สำเร็จ (' + pfScannedSet.size + '/' + pfDrugNames.length + ')');
        setTimeout(() => showToast(''), 1500);
    }

    // Known High Alert drug names
    const haDrugNames = ['heparin','enoxaparin','warfarin','insulin','morphine','fentanyl','potassium chloride','digoxin','epinephrine','norepinephrine','dopamine'];
    function isHighAlertDrug(name) {
        const n = name.toLowerCase();
        return haDrugNames.some(ha => n.includes(ha));
    }
    function haBadge(name) {
        return isHighAlertDrug(name) ? ' <span style="background:linear-gradient(135deg,#DC2626,#EF4444);color:white;font-size:7px;font-weight:800;padding:2px 7px;border-radius:4px;letter-spacing:0.3px;vertical-align:middle;">HA</span>' : '';
    }
    function ibfItemBadge() {
        return '<span class="md-item-inline-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>Item-based</span>';
    }
    function schedBasedBadge() {
        return '<span class="sched-inline-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Schedule-based</span>';
    }

    // HA verification — modes: 'prep' (2 witnesses), 'witness' (1 witness), and 'dispense' (self-scan)
    let haVerifyCallback = null;
    let haVerifyMode = 'prep'; // 'prep', 'witness', or 'dispense'
    let haWitnessCount = 0;

    function showHAVerifyModal(drugName, lotText, callback, mode) {
        haVerifyCallback = callback;
        haVerifyMode = mode || 'prep';
        haWitnessCount = 0;
        document.getElementById('haVerifyName').textContent = drugName;
        document.getElementById('haVerifyLot').textContent = lotText;
        // Update modal text based on mode
        var titleEl = document.querySelector('#haVerifyModal [style*="font-size:20px"][style*="font-weight:800"]');
        var subEl = document.querySelector('#haVerifyModal [style*="font-size:12px"][style*="rgba(255,255,255,0.75)"]');
        var scanTitle = document.querySelector('#haVerifyScanArea [style*="font-size:14px"][style*="font-weight:700"]');
        var scanSub = document.querySelector('#haVerifyScanArea [style*="font-size:12px"][style*="color:var(--text-3)"]');
        var scanBtn = document.querySelector('#haVerifyScanArea .btn-stat, #haVerifyScanArea [onclick="haVerifyScan()"]');
        if (haVerifyMode === 'prep') {
            if (titleEl) titleEl.textContent = 'High Alert — ต้องมีพยาน 2 คน';
            if (subEl) subEl.textContent = 'สแกนบัตรพยานคนที่ 1 เพื่อยืนยัน';
            if (scanTitle) scanTitle.textContent = 'สแกนบัตรพยานคนที่ 1';
            if (scanSub) scanSub.textContent = 'ให้พยานคนที่ 1 วางบัตรที่เครื่องอ่าน';
            if (scanBtn) scanBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>สแกนบัตรพยาน';
        } else if (haVerifyMode === 'witness') {
            if (titleEl) titleEl.textContent = 'High Alert — สแกนพยาน 1 คน';
            if (subEl) subEl.textContent = 'สแกนบัตรพยานเพื่อยืนยัน Double Check';
            if (scanTitle) scanTitle.textContent = 'สแกนบัตรพยาน';
            if (scanSub) scanSub.textContent = 'ให้เจ้าหน้าที่พยานวางบัตรที่เครื่องอ่าน';
            if (scanBtn) scanBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>สแกนบัตรพยาน';
        } else {
            if (titleEl) titleEl.textContent = 'High Alert — ยืนยันตัวตน';
            if (subEl) subEl.textContent = 'สแกนบัตรพนักงานของคุณอีกครั้ง';
            if (scanTitle) scanTitle.textContent = 'สแกนบัตรพนักงานเพื่อยืนยัน';
            if (scanSub) scanSub.textContent = 'วางบัตรพนักงานของคุณที่เครื่องอ่าน';
            if (scanBtn) scanBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>สแกนบัตรยืนยัน';
        }
        document.getElementById('haVerifyModal').style.display = 'flex';
    }

    function haVerifyScan() {
        const modal = document.getElementById('haVerifyModal');
        const scanArea = document.getElementById('haVerifyScanArea');
        const successArea = document.getElementById('haVerifySuccess');

        if (haVerifyMode === 'prep') {
            haWitnessCount++;
            if (haWitnessCount < 2) {
                // Show success for witness 1, then ask for witness 2
                scanArea.style.display = 'none';
                successArea.style.display = '';
                var successTitle = successArea.querySelector('[style*="font-size:18px"]');
                var successSub = successArea.querySelector('[style*="font-size:12px"]');
                if (successTitle) successTitle.textContent = 'พยานคนที่ 1 ยืนยันแล้ว';
                if (successSub) successSub.textContent = 'กำลังเตรียมสแกนพยานคนที่ 2...';
                setTimeout(() => {
                    successArea.style.display = 'none';
                    scanArea.style.display = '';
                    // Update text for witness 2
                    var scanTitle = document.querySelector('#haVerifyScanArea [style*="font-size:14px"][style*="font-weight:700"]');
                    var scanSub = document.querySelector('#haVerifyScanArea [style*="font-size:12px"][style*="color:var(--text-3)"]');
                    var modalSub = document.querySelector('#haVerifyModal [style*="font-size:12px"][style*="rgba(255,255,255,0.75)"]');
                    if (scanTitle) scanTitle.textContent = 'สแกนบัตรพยานคนที่ 2';
                    if (scanSub) scanSub.textContent = 'ให้พยานคนที่ 2 วางบัตรที่เครื่องอ่าน';
                    if (modalSub) modalSub.textContent = 'สแกนบัตรพยานคนที่ 2 เพื่อยืนยัน';
                }, 1200);
                return;
            }
            // Witness 2 done — complete
        }

        // Final success (dispense mode or witness 2 done)
        scanArea.style.display = 'none';
        successArea.style.display = '';
        var successTitle = successArea.querySelector('[style*="font-size:18px"]');
        var successSub = successArea.querySelector('[style*="font-size:12px"]');
        if (haVerifyMode === 'prep') {
            if (successTitle) successTitle.textContent = 'พยาน 2 คน ยืนยันครบแล้ว';
            if (successSub) successSub.textContent = 'กำลังบันทึก...';
        } else if (haVerifyMode === 'witness') {
            if (successTitle) successTitle.textContent = 'พยานยืนยันสำเร็จ';
            if (successSub) successSub.textContent = 'Double Check ผ่าน กำลังบันทึก...';
        } else {
            if (successTitle) successTitle.textContent = 'ยืนยันตัวตนสำเร็จ';
            if (successSub) successSub.textContent = 'กำลังบันทึก...';
        }
        setTimeout(() => {
            modal.style.display = 'none';
            scanArea.style.display = '';
            successArea.style.display = 'none';
            if (haVerifyCallback) {
                haVerifyCallback();
                haVerifyCallback = null;
            }
        }, 1500);
    }

    function haVerifyCancel() {
        document.getElementById('haVerifyModal').style.display = 'none';
        document.getElementById('haVerifyScanArea').style.display = '';
        document.getElementById('haVerifySuccess').style.display = 'none';
        haVerifyCallback = null;
        haWitnessCount = 0;
    }

    function pfUpdateScanList() {
        const container = document.getElementById('pfScanResult');
        if (pfScannedSet.size === 0) { container.style.display = 'none'; return; }
        container.style.display = '';
        let html = '<div class="pf-result-head"><span class="pf-result-badge" id="pfScanStatus"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> สแกนแล้ว ' + pfScannedSet.size + ' รายการ</span><span class="pf-result-name" id="pfScanName">พร้อมยืนยันเข้าช่อง</span></div>';
        html += '<div style="padding:12px 16px;display:flex;flex-direction:column;gap:6px;">';
        pfScannedSet.forEach(idx => {
            html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border:1px solid rgba(13,148,136,0.12);border-radius:10px;">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
                + '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text-1);">' + pfDrugNames[idx] + '</div>'
                + '<div style="font-size:10px;color:var(--text-3);">Lot: ' + pfDrugLots[idx] + ' · Exp: ' + pfDrugExp[idx] + ' · ' + pfDrugQty[idx] + '</div></div>'
                + '<span style="font-size:10px;font-weight:700;color:#0D9488;">ตรงกัน</span>'
                + '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function pfConfirmDrug() {
        const items = document.querySelectorAll('#pfListScroll .pf-drug-item');
        pfScannedSet.forEach(idx => {
            const item = items[idx];
            if (item && !item.classList.contains('done')) {
                item.classList.remove('scanned');
                item.classList.add('done');
                item.style.borderColor = 'transparent';
                item.style.background = '';
                item.querySelector('.pf-drug-check').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                item.querySelector('.pf-drug-check').style.borderColor = 'var(--green)';
                item.querySelector('.pf-drug-check').style.background = 'var(--green)';
                pfDoneCount++;
            }
        });
        document.getElementById('pfProgress').textContent = 'จัดแล้ว ' + pfDoneCount + '/' + pfTotalDrugs;
        pfScannedSet.clear();
        document.getElementById('pfScanResult').style.display = 'none';
        document.getElementById('pfBtnConfirm').disabled = true;
        document.getElementById('pfBtnConfirm').style.opacity = '0.4';
        document.getElementById('pfBtnConfirm').style.cursor = 'not-allowed';
        ptdCommitCassetteLock('patient', buildPatientCassetteLockMeta());

        // enable summary button when at least 1 drug is done
        if (pfDoneCount > 0) {
            const sumBtn = document.getElementById('pfBtnSummary');
            sumBtn.disabled = false;
            sumBtn.style.opacity = '1';
            sumBtn.style.cursor = 'pointer';
        }
        if (pfDoneCount >= pfTotalDrugs) {
            markCurrentCassetteFilled();
            showToast('จัดยาครบทุกรายการแล้ว — ไปหน้าสรุปผลได้');
        } else {
            showToast('ยืนยัน ' + pfDoneCount + '/' + pfTotalDrugs + ' รายการ — สแกนรายการถัดไปได้เลย');
        }
        setTimeout(() => showToast(''), 2000);
    }

    /* ── Drawer / Cassette selection (Page 7) ── */
    const drawerData = Array.from({ length: STANDARD_CART_DRAWERS }).reduce(function(acc, _, drawerIdx) {
        const drawerNum = drawerIdx + 1;
        const prefix = String.fromCharCode(65 + drawerIdx);
        acc[drawerNum] = {
            label: 'Drawer ' + drawerNum,
            status: 'ok',
            statusText: 'พร้อมใช้งาน',
            cassettes: Array.from({ length: STANDARD_CART_CASSETTES_PER_DRAWER }).map(function(__, cassIdx) {
                return { id: prefix + (cassIdx + 1), status: 'ok', label: 'พร้อมใช้งาน' };
            })
        };
        return acc;
    }, {});


    // ── PRN Flow State ────────────────────────────────────────────────
    var prnHwDrawerNum = 1;
    var prnHwCassId = '';
    var prnActiveDrug = null; // { name, code, form, unit }
    var prnFillLog = []; // [{ drugName, qty, unit, lot, exp, cassette, ts }]

    var prnDrugCatalog = [
        { name: 'Morphine 10 mg/mL', code: 'DRG-MO001', form: 'Injection', unit: 'vial', ha: true },
        { name: 'Tramadol 50 mg', code: 'DRG-TR002', form: 'เม็ด (Tablet)', unit: 'เม็ด', ha: false },
        { name: 'Paracetamol 500 mg', code: 'DRG-PC003', form: 'เม็ด (Tablet)', unit: 'เม็ด', ha: false },
        { name: 'Metoclopramide 10 mg', code: 'DRG-MT004', form: 'เม็ด (Tablet)', unit: 'เม็ด', ha: false },
        { name: 'Diazepam 5 mg', code: 'DRG-DZ005', form: 'เม็ด (Tablet)', unit: 'เม็ด', ha: true },
        { name: 'Salbutamol Inhaler', code: 'DRG-SB006', form: 'Inhaler', unit: 'ขวด', ha: false },
        { name: 'Ondansetron 4 mg', code: 'DRG-ON007', form: 'เม็ด (Tablet)', unit: 'เม็ด', ha: false },
        { name: 'Fentanyl 50 mcg/mL', code: 'DRG-FN008', form: 'Injection', unit: 'vial', ha: true },
    ];

    // Aggregate current PRN stock from cassette locks (active + completed).
    // Returns array: [{ name, code, form, unit, ha, qty, cassettes:[{drawer,cassette,qty,lot,exp}] }]
    function getPrnStockInventory() {
        var byDrug = {};
        function collectFrom(source) {
            if (!source) return;
            Object.keys(source).forEach(function(key) {
                var lock = source[key];
                if (!lock || lock.mode !== 'prn') return;
                var items = Array.isArray(lock.cassetteItems) ? lock.cassetteItems : [];
                items.forEach(function(item) {
                    var name = item.drugName;
                    if (!name) return;
                    var nKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(name) : name;
                    var catalogEntry = prnDrugCatalog.find(function(c) {
                        var cKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(c.name) : c.name;
                        return cKey === nKey;
                    });
                    // parse qty from dose like "5 เม็ด" or fall back to 1
                    var qty = 0;
                    if (typeof item.qty === 'number') qty = item.qty;
                    else {
                        var m = String(item.dose || '').match(/(\d+)/);
                        qty = m ? parseInt(m[1], 10) : 1;
                    }
                    if (!byDrug[nKey]) {
                        byDrug[nKey] = {
                            name: name,
                            code: catalogEntry ? catalogEntry.code : '',
                            form: catalogEntry ? catalogEntry.form : '',
                            unit: (catalogEntry && catalogEntry.unit) || item.unit || 'หน่วย',
                            ha: catalogEntry ? !!catalogEntry.ha : !!item.highAlert,
                            qty: 0,
                            cassettes: []
                        };
                    }
                    byDrug[nKey].qty += qty;
                    byDrug[nKey].cassettes.push({
                        key: key,
                        drawer: lock.drawer,
                        cassette: lock.cassette,
                        qty: qty,
                        lot: item.lot || 'N/A',
                        exp: item.exp || 'N/A'
                    });
                });
            });
        }
        // Prefer completed (final), fall back to in-progress locks
        collectFrom(typeof cassetteModeCompleted !== 'undefined' ? cassetteModeCompleted : null);
        // Also include active locks for any keys not already counted from completed
        if (typeof cassetteModeLocks !== 'undefined') {
            Object.keys(cassetteModeLocks).forEach(function(key) {
                if (typeof cassetteModeCompleted !== 'undefined' && cassetteModeCompleted[key]) return;
                var partial = {}; partial[key] = cassetteModeLocks[key];
                collectFrom(partial);
            });
        }
        return Object.values(byDrug);
    }

    // Decrement PRN stock across cassettes (FIFO by lot). Returns total decremented.
    function decrementPrnStock(drugName, qtyNeeded) {
        if (!drugName || qtyNeeded <= 0) return 0;
        var nKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(drugName) : drugName;
        var remaining = qtyNeeded;
        var sources = [cassetteModeCompleted, cassetteModeLocks];
        sources.forEach(function(store) {
            if (!store) return;
            Object.keys(store).forEach(function(key) {
                if (remaining <= 0) return;
                var lock = store[key];
                if (!lock || lock.mode !== 'prn') return;
                if (!Array.isArray(lock.cassetteItems)) return;
                lock.cassetteItems.forEach(function(item) {
                    if (remaining <= 0) return;
                    var iKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(item.drugName) : item.drugName;
                    if (iKey !== nKey) return;
                    var have = typeof item.qty === 'number' ? item.qty : (parseInt(String(item.dose||'').match(/(\d+)/)?.[1] || '1', 10));
                    var take = Math.min(have, remaining);
                    item.qty = have - take;
                    var unitPart = String(item.dose || '').replace(/\d+\s*/, '').trim() || (item.unit || '');
                    item.dose = item.qty + (unitPart ? ' ' + unitPart : '');
                    remaining -= take;
                });
                // Remove items with 0 qty
                lock.cassetteItems = lock.cassetteItems.filter(function(it) {
                    return !(typeof it.qty === 'number' && it.qty <= 0);
                });
                // If cassette is empty, clear the lock from both stores so cassette becomes free
                if (lock.cassetteItems.length === 0) {
                    if (cassetteModeLocks) delete cassetteModeLocks[key];
                    if (cassetteModeCompleted) delete cassetteModeCompleted[key];
                }
            });
        });
        if (typeof persistCassetteModeState === 'function') persistCassetteModeState();
        if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
        return qtyNeeded - remaining;
    }

    function prnSelectDrawer(el, num) {
        prnHwDrawerNum = num;
        document.querySelectorAll('#pg-prn-hw .dw-btn').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        prnRenderCassettes(num);
    }

    function prnRenderCassettes(num) {
        const d = drawerData[num];
        if (!d) return;
        document.getElementById('prnCassDrawerLabel').textContent = d.label;
        const statusEl = document.getElementById('prnCassDrawerStatus');
        statusEl.className = 'dw-status ' + d.status;
        statusEl.innerHTML = (d.status==='ok' ? '<span class="dot"></span> ' : '') + d.statusText;
        document.getElementById('prnCassBadge').textContent = d.cassettes.length + ' Cassette';
        const grid = document.getElementById('prnCassGrid');
        const chkSvg = '<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        grid.innerHTML = d.cassettes.map(c => {
            const lockKey = ptdCassetteKey(num, parseInt(c.id.replace(/[A-Za-z]/g,'')) || 1);
            const lockedDrug = getCassetteSingleDrug(lockKey);
            const isLocked = !!lockedDrug;
            var cls = c.status==='error' ? 'cass error'
                    : isLocked ? 'cass drug-locked'
                    : c.status==='empty' ? 'cass empty'
                    : c.status==='full'  ? 'cass full'
                    : 'cass';
            const click = (c.status==='error' || isLocked) ? '' : 'onclick="prnSelectCass(this,\'' + c.id + '\')"';
            const lbl = isLocked ? lockedDrug.split(' ').slice(0,2).join(' ') : c.label;
            return '<div class="' + cls + '" ' + click + (isLocked ? ' title="ผูกกับ ' + escHtml(lockedDrug) + '"' : '') + '>'
                + '<div class="cass-check">' + chkSvg + '</div>'
                + '<div class="cass-id">' + c.id + '</div>'
                + '<div class="cass-status-dot ' + (isLocked ? 'full' : c.status) + '"></div>'
                + '<div class="cass-lbl">' + (isLocked ? '🔒 ' + lbl : lbl) + '</div>'
                + '</div>';
        }).join('');
        document.getElementById('btnPrnHwConfirm').disabled = true;
        document.getElementById('btnPrnHwLabel').textContent = 'เลือก Cassette ก่อน';
    }

    function prnSelectCass(el, cassId) {
        document.querySelectorAll('#prnCassGrid .cass').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        prnHwCassId = cassId;
        const btn = document.getElementById('btnPrnHwConfirm');
        const lbl = document.getElementById('btnPrnHwLabel');
        btn.disabled = false;
        lbl.textContent = 'ยืนยัน D' + prnHwDrawerNum + ' · ' + cassId;
        document.getElementById('prnHwHint').style.display = 'none';
    }

    function prnConfirmHw() {
        if (!prnHwCassId) return;
        prnFillLog = [];
        prnActiveDrug = null;
        document.getElementById('prnFillDw').textContent = 'D' + prnHwDrawerNum;
        document.getElementById('prnFillCass').textContent = prnHwCassId;
        nav('pg-prn-fill');
        setTimeout(function() {
            prnRenderDrugList();
            // Show cassette lock banner if cassette already has a drug assigned
            const cassNum = parseInt((prnHwCassId || '').replace(/[A-Za-z]/g, '')) || 1;
            const lockedDrug = getCassetteSingleDrug(ptdCassetteKey(prnHwDrawerNum, cassNum));
            const banner = document.getElementById('prnCassLockBanner');
            if (banner) {
                if (lockedDrug) {
                    document.getElementById('prnCassLockText').textContent = 'Cassette ' + prnHwCassId + ' ผูกกับ ' + lockedDrug + ' แล้ว — เลือกยาชนิดเดิมเพื่อเติมต่อ';
                    banner.style.display = 'flex';
                } else {
                    banner.style.display = 'none';
                }
            }
        }, 50);
    }

    function prnRenderDrugList() {
        const list = document.getElementById('prnDrugList');
        if (!list) return;
        const cassNum = parseInt((prnHwCassId || '').replace(/[A-Za-z]/g, '')) || 1;
        const lockKey = ptdCassetteKey(prnHwDrawerNum, cassNum);
        const lockedDrug = getCassetteSingleDrug(lockKey);
        document.getElementById('prnDrugCount').textContent = prnDrugCatalog.length + ' รายการ';
        list.innerHTML = prnDrugCatalog.map((drug, i) => {
            const logged = prnFillLog.filter(l => l.drugName === drug.name).reduce((s,l) => s+l.qty, 0);
            const isDone = logged > 0;
            const isBlocked = !!lockedDrug && normalizeIbfDrugName(lockedDrug) !== normalizeIbfDrugName(drug.name);
            const haTag = drug.ha ? '<span style="background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;font-size:9px;font-weight:800;padding:1px 6px;border-radius:6px;margin-left:4px;">HA</span>' : '';
            const itemStyle = isDone ? 'border-color:#FBCFE820;background:linear-gradient(135deg,#FDF2F8,#FCE7F3);'
                            : isBlocked ? 'opacity:0.38;cursor:not-allowed;'
                            : '';
            return '<div class="pf-drug-item' + (isDone ? ' done' : '') + '" onclick="prnPickDrug(' + i + ')" style="' + itemStyle + '">'
                + '<div class="pf-drug-check" style="' + (isDone ? 'background:#DB2777;border-color:#DB2777;' : '') + '">'
                + (isDone ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" style="opacity:0;"><path d="M20 6L9 17l-5-5"/></svg>')
                + '</div>'
                + '<div style="flex:1;min-width:0;">'
                + '<div class="pf-drug-name" style="' + (isDone ? 'color:#831843;' : '') + '">' + escHtml(drug.name) + haTag + '</div>'
                + '<div class="pf-drug-sub">' + drug.code + ' · ' + drug.form + (isDone ? ' · เติมแล้ว ' + logged + ' ' + drug.unit : isBlocked ? ' · Cassette นี้ใช้ยาชนิดอื่นแล้ว' : '') + '</div>'
                + '</div>'
                + '<div class="pf-drug-qty" style="color:#DB2777;">' + drug.unit + '</div>'
                + '</div>';
        }).join('');
    }

    function prnPickDrug(idx) {
        const drug = prnDrugCatalog[idx];
        // 1 Cassette = 1 drug: block if cassette is locked to a different drug
        const cassNum = parseInt((prnHwCassId || '').replace(/[A-Za-z]/g, '')) || 1;
        const lockKey = ptdCassetteKey(prnHwDrawerNum, cassNum);
        const lockedDrug = getCassetteSingleDrug(lockKey);
        if (lockedDrug && normalizeIbfDrugName(lockedDrug) !== normalizeIbfDrugName(drug.name)) {
            showToast('Cassette ' + prnHwCassId + ' ผูกกับ ' + lockedDrug + ' แล้ว — 1 Cassette ใส่ยาได้ 1 ชนิดเท่านั้น');
            setTimeout(() => showToast(''), 2800);
            return;
        }
        prnActiveDrug = drug;
        document.getElementById('prnFillDrugName').textContent = prnActiveDrug.name;
        document.getElementById('prnFillDrugMeta').textContent = prnActiveDrug.code + ' · ' + prnActiveDrug.form;
        document.getElementById('prnScanTitle').textContent = 'สแกนยา ' + prnActiveDrug.name;
        document.getElementById('prnScanDesc').textContent = 'สแกนบาร์โค้ดยาเพื่อตรวจสอบ Lot และวันหมดอายุก่อนเติม';
        document.getElementById('prnScanResult').style.display = 'none';
        const scanBtn = document.getElementById('btnPrnScan');
        scanBtn.disabled = false;
        scanBtn.style.opacity = '1';
        scanBtn.style.cursor = 'pointer';
        const saveBtn = document.getElementById('btnPrnSave');
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.4';
        saveBtn.style.cursor = 'not-allowed';
        // highlight active
        document.querySelectorAll('#prnDrugList .pf-drug-item').forEach((el,i) => {
            el.style.outline = i===idx ? '2px solid #DB2777' : '';
        });
    }

    function prnDoScan() {
        if (!prnActiveDrug) return;
        const lot = 'LOT-' + Math.floor(Math.random()*90000+10000);
        const expYear = 2568 + Math.floor(Math.random()*2);
        const expMonth = String(Math.floor(Math.random()*12)+1).padStart(2,'0');
        document.getElementById('prnResultName').textContent = prnActiveDrug.name;
        document.getElementById('prnResultLot').textContent = lot;
        document.getElementById('prnResultExp').textContent = expMonth + '/' + expYear;
        document.getElementById('prnResultCass').textContent = 'D' + prnHwDrawerNum + ' · ' + prnHwCassId;
        document.getElementById('prnUnitLabel').textContent = prnActiveDrug.unit;
        document.getElementById('prnQtyInput').value = 1;
        document.getElementById('prnScanResult').style.display = '';
        const saveBtn = document.getElementById('btnPrnSave');
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
        saveBtn.style.cursor = 'pointer';
        showToast('สแกนยา ' + prnActiveDrug.name + ' ผ่าน — ระบุจำนวนแล้วกดบันทึก');
        setTimeout(() => showToast(''), 2000);
    }

    function prnQtyAdj(delta) {
        const inp = document.getElementById('prnQtyInput');
        if (!inp) return;
        inp.value = Math.max(1, (parseInt(inp.value) || 1) + delta);
    }

    function prnSave() {
        if (!prnActiveDrug) return;
        const lot = document.getElementById('prnResultLot').textContent;
        const exp = document.getElementById('prnResultExp').textContent;
        const qty = Math.max(1, parseInt(document.getElementById('prnQtyInput').value) || 1);

        // 1 Cassette = 1 drug: block saving if cassette already has a different drug
        const cassNum = parseInt((prnHwCassId || '').replace(/[A-Za-z]/g, '')) || 1;
        const lockKey = ptdCassetteKey(prnHwDrawerNum, cassNum);
        const lockedDrug = getCassetteSingleDrug(lockKey);
        if (lockedDrug && normalizeIbfDrugName(lockedDrug) !== normalizeIbfDrugName(prnActiveDrug.name)) {
            showToast('Cassette ' + prnHwCassId + ' ผูกกับ ' + lockedDrug + ' แล้ว — เลือก Cassette ใหม่');
            setTimeout(() => showToast(''), 2800);
            return;
        }

        prnFillLog.push({
            drugName: prnActiveDrug.name,
            qty: qty,
            unit: prnActiveDrug.unit,
            lot: lot,
            exp: exp,
            cassette: 'D' + prnHwDrawerNum + ' · ' + prnHwCassId,
            ts: new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }),
            ha: prnActiveDrug.ha
        });

        // Register cassette lock in shared map so Drawer Map reflects it.
        // Aggregate all prnFillLog entries for this cassette into cassetteItems (qty per drug with status จัดแล้ว).
        const cassLabel = 'D' + prnHwDrawerNum + ' · ' + prnHwCassId;
        const entriesForCass = prnFillLog.filter(function(l) { return l.cassette === cassLabel; });
        const drugAgg = {};
        entriesForCass.forEach(function(l) {
            const key = normalizeIbfDrugName(l.drugName);
            if (!drugAgg[key]) {
                drugAgg[key] = { drugName: l.drugName, qty: 0, unit: l.unit, lot: l.lot, exp: l.exp, ha: l.ha, ts: l.ts };
            }
            drugAgg[key].qty += l.qty;
            drugAgg[key].ts = l.ts;
        });
        const cassetteItems = Object.values(drugAgg).map(function(a) {
            return normalizeCassetteItem({
                drugName: a.drugName,
                dose: a.qty + ' ' + a.unit,
                round: 'PRN',
                lot: a.lot,
                exp: a.exp,
                highAlert: !!a.ha,
                status: 'จัดแล้ว',
                done: true,
                preparedTime: a.ts
            });
        }).filter(Boolean);
        cassetteModeLocks[lockKey] = {
            mode: 'prn',
            drawer: prnHwDrawerNum,
            cassette: cassNum,
            drugName: prnActiveDrug.name,
            drugNames: [prnActiveDrug.name],
            cassetteItems: cassetteItems,
            ward: currentWardName || DEFAULT_DEMO_WARD,
            completedAt: new Date().toISOString()
        };
        // Also record as completed so Drawer Map shows "เติมยาเรียบร้อยแล้ว"
        cassetteModeCompleted[lockKey] = Object.assign({}, cassetteModeLocks[lockKey]);
        persistCassetteModeState();
        if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
        document.getElementById('prnScanResult').style.display = 'none';
        const saveBtn = document.getElementById('btnPrnSave');
        saveBtn.disabled = true; saveBtn.style.opacity = '0.4'; saveBtn.style.cursor = 'not-allowed';
        const scanBtn = document.getElementById('btnPrnScan');
        scanBtn.disabled = false; scanBtn.style.opacity = '1'; scanBtn.style.cursor = 'pointer';
        prnRenderDrugList();
        showToast('บันทึก ' + prnActiveDrug.name + ' ' + qty + ' ' + prnActiveDrug.unit + ' เรียบร้อย ✓');
        setTimeout(() => showToast(''), 2200);
        prnActiveDrug = null;
        document.getElementById('prnFillDrugName').textContent = '— เลือกยา —';
        document.getElementById('prnFillDrugMeta').textContent = 'เลือกรายการยาจากรายการด้านซ้าย';
        document.getElementById('prnScanTitle').textContent = 'เลือกรายการยาก่อน';
        document.getElementById('prnScanDesc').textContent = 'เลือกยาที่ต้องการเติมจากรายการด้านซ้าย แล้วสแกนบาร์โค้ดยา';
        scanBtn.disabled = true; scanBtn.style.opacity = '0.4'; scanBtn.style.cursor = 'not-allowed';
        document.querySelectorAll('#prnDrugList .pf-drug-item').forEach(el => el.style.outline = '');
    }

    function prnGoSummary() {
        prnRenderSummary();
        nav('pg-prn-summary');
    }

    function prnRenderSummary() {
        const totalDrugs = [...new Set(prnFillLog.map(l => l.drugName))].length;
        const totalQty = prnFillLog.reduce((s,l) => s+l.qty, 0);
        const cassette = 'D' + prnHwDrawerNum + ' · ' + prnHwCassId;

        document.getElementById('prnSumCtx').innerHTML =
            '<span class="fill-ctx-chip">รถเข็น: <strong>A-1</strong></span>'
            + '<span class="fill-ctx-chip">Drawer: <strong>D' + prnHwDrawerNum + '</strong></span>'
            + '<span class="fill-ctx-chip">Cassette: <strong>' + prnHwCassId + '</strong></span>'
            + '<span class="fill-ctx-chip" style="background:#FDF2F8;border-color:#FBCFE8;color:#9F1239;"><strong style="color:#DB2777;">ยาสำรอง (PRN)</strong></span>';

        document.getElementById('prnSumStats').innerHTML =
            '<div class="ss"><div class="ss-num" style="color:#DB2777;">' + prnFillLog.length + '</div><div class="ss-label">รายการที่บันทึก</div></div>'
            + '<div class="ss"><div class="ss-num green">' + totalDrugs + '</div><div class="ss-label">ชนิดยา</div></div>'
            + '<div class="ss"><div class="ss-num blue">' + totalQty + '</div><div class="ss-label">จำนวนรวม</div></div>'
            + '<div class="ss"><div class="ss-num red">0</div><div class="ss-label">มีปัญหา</div></div>';

        let tableHtml = '<div class="sum-table-head" style="color:#831843;">'
            + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DB2777" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
            + ' รายการยาสำรองที่เติม</div>';

        if (prnFillLog.length === 0) {
            tableHtml += '<div class="st-row" style="justify-content:center;padding:24px;color:var(--text-3);">ยังไม่มีรายการ — กลับไปเติมยาก่อน</div>';
        } else {
            tableHtml += '<div class="st-row header-row"><div>ยา</div><div style="text-align:center">จำนวน</div><div style="text-align:center">Lot / Expiry</div><div style="text-align:center">Cassette</div><div style="text-align:center">สถานะ</div></div>';
            prnFillLog.forEach(function(log) {
                const haTag = log.ha ? '<span style="background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;font-size:9px;font-weight:800;padding:1px 5px;border-radius:5px;margin-left:4px;">HA</span>' : '';
                tableHtml += '<div class="st-row" style="background:#FDF2F8;">'
                    + '<div><div class="st-name" style="color:#831843;">' + escHtml(log.drugName) + haTag
                    + ' <span style="background:#DB2777;color:white;font-size:9px;font-weight:800;padding:1px 7px;border-radius:10px;margin-left:3px;">PRN</span></div>'
                    + '<div class="st-sub">' + log.ts + '</div></div>'
                    + '<div class="st-val" style="color:#DB2777;font-weight:800;">' + log.qty + ' ' + log.unit + '</div>'
                    + '<div class="st-val">' + log.lot + ' · ' + log.exp + '</div>'
                    + '<div class="st-val">' + log.cassette + '</div>'
                    + '<div style="text-align:center"><span class="st-status ok"><span class="dot"></span> บันทึกแล้ว</span></div>'
                    + '</div>';
            });
        }
        document.getElementById('prnSumTable').innerHTML = tableHtml;
    }

    function prnSaveFinal() {
        showToast('บันทึกยาสำรองเรียบร้อยแล้ว ✓');
        setTimeout(function() { showToast(''); nav('pg-dashboard'); }, 1800);
    }
    // ── END PRN Flow ──────────────────────────────────────────────────

    function selectDrawer(el, num) {
        if (el.classList.contains('locked')) return;
        document.querySelectorAll('.dw-btn').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        renderCassettes(num);
    }

    function renderCassettes(num) {
        const d = drawerData[num];
        if (!d) return;
        document.getElementById('cassDrawerLabel').textContent = d.label;
        const statusEl = document.getElementById('cassDrawerStatus');
        statusEl.className = 'dw-status ' + d.status;
        statusEl.innerHTML = (d.status==='ok'?'<span class="dot"></span> ':'')+d.statusText;
        document.getElementById('cassBadge').textContent = d.cassettes.length + ' Cassette';

        const grid = document.getElementById('cassGrid');
        const chkSvg = '<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        grid.innerHTML = d.cassettes.map(c => {
            const lockKey = ptdCassetteKey(num, parseInt(c.id.replace(/[A-Za-z]/g,'')) || 1);
            const lockedDrug = getCassetteSingleDrug(lockKey);
            const isLocked = !!lockedDrug;
            var cls = c.status==='error' ? 'cass error'
                    : isLocked ? 'cass drug-locked'
                    : c.status==='empty' ? 'cass empty'
                    : c.status==='full'  ? 'cass full'
                    : 'cass';
            const click = (c.status==='error' || isLocked) ? '' : 'onclick="selectCass(this)"';
            const lbl = isLocked ? lockedDrug.split(' ').slice(0,2).join(' ') : c.label;
            return '<div class="'+cls+'" '+click+(isLocked?' title="ผูกกับ '+escHtml(lockedDrug)+'"':'')+' data-cass-id="'+c.id+'">'
                +'<div class="cass-check">'+chkSvg+'</div>'
                +'<div class="cass-id">'+c.id+'</div>'
                +'<div class="cass-status-dot '+(isLocked?'full':c.status)+'"></div>'
                +'<div class="cass-lbl">'+(isLocked?'🔒 '+lbl:lbl)+'</div>'
                +'</div>';
        }).join('');

        document.getElementById('btnHwConfirm').disabled = true;
    }

    function selectCass(el) {
        if (el.classList.contains('error') || el.classList.contains('drug-locked')) return;
        el.classList.toggle('selected');
        const selected = document.querySelectorAll('.cass.selected');
        const any = selected.length > 0;
        const btn = document.getElementById('btnHwConfirm');
        const lbl = document.getElementById('btnHwConfirmLabel');
        const hint = document.getElementById('hwSelectionHint');
        btn.disabled = !any;
        if (any) {
            const ids = Array.from(selected).map(c => c.querySelector('.cass-id').textContent);
            if (lbl) lbl.textContent = 'ยืนยัน ' + ids.join(', ');
            if (hint) hint.style.display = 'none';
        } else {
            if (lbl) lbl.textContent = 'เลือก Cassette ก่อน';
            if (hint) hint.style.display = 'flex';
        }
    }

    function confirmHw() {
        const selected = document.querySelectorAll('.cass.selected');
        if (!selected.length) return;
        const ids = Array.from(selected).map(c => c.querySelector('.cass-id').textContent);
        // Pass context to fill page
        const activeDw = document.querySelector('.dw-btn.active .dw-num');
        const dwLabel = activeDw ? activeDw.textContent : 'D1';
        document.getElementById('fillDw').textContent = dwLabel;
        document.getElementById('fillCass').textContent = ids.join(', ');
        document.getElementById('fillWard').textContent = document.getElementById('hwWard').textContent.replace('Ward ','');
        // Register cassettes into the shared lock map so Dashboard panel updates
        const drawerNum = parseInt(dwLabel.replace('D', '')) || 1;
        ids.forEach(function(id) {
            const cassNum = parseInt(id.replace(/[A-Za-z]/g, '')) || 1;
            const key = ptdCassetteKey(drawerNum, cassNum);
            cassetteModeLocks[key] = { mode: 'patient', drawer: drawerNum, cassette: cassNum, ward: currentWardName || DEFAULT_DEMO_WARD };
        });
        persistCassetteModeState();
        if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
        // Reset scan state
        document.getElementById('scanResult').style.display = 'none';
        document.getElementById('btnConfirmFill').disabled = true;
        nav('pg-fill');
    }


    /* ── Fill page (Page 8) ── */
    function selectRx(el, idx) {
        document.querySelectorAll('.rx-item').forEach(r => r.classList.remove('active'));
        el.classList.add('active');
    }

    function selectSlot(el) {
        document.querySelectorAll('.cm-cell').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }

    function demoScan() {
        document.getElementById('scanResult').style.display = '';
        document.getElementById('srStatus').className = 'sr-status pass';
        document.getElementById('srStatus').textContent = 'ผ่าน';
        document.getElementById('srDrugName').textContent = 'Amlodipine 5 mg';
        var btn = document.getElementById('btnConfirmFill');
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.02)';
        setTimeout(function(){ btn.style.transform = ''; }, 200);
        var hint = document.getElementById('scanHint');
        if (hint) hint.style.display = 'none';
        showToast('สแกนสำเร็จ — ยาถูกต้อง');
        setTimeout(() => showToast(''), 2000);
    }

    function clearScan() {
        document.getElementById('scanResult').style.display = 'none';
        var btn = document.getElementById('btnConfirmFill');
        btn.disabled = true;
        btn.style.opacity = '0.45';
        var hint = document.getElementById('scanHint');
        if (hint) hint.style.display = '';
    }

    function confirmFill() {
        const activeSlot = document.querySelector('.cm-cell.active');
        if (activeSlot) {
            activeSlot.classList.remove('active');
            activeSlot.classList.add('done');
            activeSlot.querySelector('.cm-cell-lbl').textContent = 'จัดครบ';
            activeSlot.removeAttribute('onclick');
        }
        // Rebuild cassette items from current source of truth (not merge/accumulate)
        var key = ptdCurrentCassetteKey ? ptdCurrentCassetteKey() : null;
        if (key && cassetteModeLocks[key]) {
            var meta = buildCassetteLockMetaForMode(cassetteModeLocks[key].mode) || {};
            // Replace items entirely — don't merge with old data
            cassetteModeLocks[key].cassetteItems = (meta.cassetteItems || []).map(normalizeCassetteItem).filter(Boolean);
            var names = cassetteDrugNamesFromItems(cassetteModeLocks[key].cassetteItems);
            if (names.length) cassetteModeLocks[key].drugNames = names;
            persistCassetteModeState();
            if (typeof renderDashboardCassettePanel === 'function') renderDashboardCassettePanel();
        }
        clearScan();
        showToast('ใส่ยาเข้าช่องสำเร็จ');
        setTimeout(() => showToast(''), 2000);
    }

    /* ── Dispense list (Page 10) ── */
    function goToDispense() {
        const ward = currentWardName || document.getElementById('ghWard')?.textContent || DEFAULT_DEMO_WARD;
        document.getElementById('dispWardHdr').textContent = ward;
        document.getElementById('dispWardChip').textContent = ward.replace('Ward ','');
        renderDispenseList();
        nav('pg-dispense');
    }

    function filterPt() {
        const q = document.getElementById('ptSearch').value.trim().toLowerCase();
        const activeFilter = document.querySelector('.disp-toolbar .filter-btn.active');
        const filterText = activeFilter ? activeFilter.textContent.trim() : 'ทั้งหมด';
        const isAllFilter = filterText.startsWith('ทั้งหมด');
        let visibleCount = 0;
        document.querySelectorAll('#ptList .pt-card').forEach(c => {
            const name = (c.dataset.name || '').toLowerCase();
            const hn   = (c.dataset.hn   || '').toLowerCase();
            const bed  = (c.dataset.bed  || '').toLowerCase();
            const status = c.dataset.status || '';
            const tags = c.dataset.tags || '';
            const matchSearch = !q || name.includes(q) || hn.includes(q) || bed.includes(q);
            let matchFilter = true;
            if (filterText.includes('รอจ่าย')) matchFilter = status !== 'done';
            else if (filterText.includes('เกินเวลา')) matchFilter = status === 'overdue';
            else if (filterText.includes('STAT') || filterText.includes('High Alert')) matchFilter = tags.includes('stat') || tags.includes('high-alert');
            const show = matchSearch && matchFilter;
            c.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });
        const clearBtn = document.getElementById('ptClearFilter');
        const emptyState = document.getElementById('ptEmptyState');
        if (clearBtn) clearBtn.classList.toggle('show', !isAllFilter || q.length > 0);
        if (emptyState) emptyState.classList.toggle('show', visibleCount === 0);
    }

    function clearDispFilter() {
        document.querySelectorAll('.disp-toolbar .filter-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        const searchEl = document.getElementById('ptSearch');
        if (searchEl) searchEl.value = '';
        filterPt();
    }

    function toggleFilter(el) {
        if (el.closest('#pg-prep-med')) {
            el.closest('#pg-prep-med').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
            filterPbm();
            return;
        }
        document.querySelectorAll('.disp-toolbar .filter-btn').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        filterPt();
    }

    /* ── Overdue flow (Page 24) ── */
    let ovCurrentStep = 1;
    let ovSelectedIdx = 0;
    const ovPatients = [
        {
            name:'นายธนกร วิเศษสิทธิ์', initials:'ธว', hn:'6405001', bed:'3A-10',
            gender:'ชาย', age:45, route:'SC', routeTh:'SC (ฉีดใต้ผิวหนัง)',
            drug:'Heparin 5000 units', dose:'5,000 units',
            dueTime:'07:30 น.', overdueText:'48 นาที', overdueScanTag:'Overdue 48 นาที',
            overdueSummary:'เลยเวลามา 48 นาที', detail:'SC · 5,000 units',
            isHighAlert:true, lot:'HEP-2025-042', expiry:'30/09/2569'
        },
        {
            name:'นางกัลยา ชัยวงศ์', initials:'กช', hn:'6403012', bed:'3A-08',
            gender:'หญิง', age:62, route:'PO', routeTh:'PO (รับประทาน)',
            drug:'Warfarin 3 mg', dose:'3 mg',
            dueTime:'07:00 น.', overdueText:'1 ชม. 18 นาที', overdueScanTag:'Overdue 1 ชม. 18 นาที',
            overdueSummary:'เลยเวลามา 1 ชม. 18 นาที', detail:'PO · 3 mg',
            isHighAlert:true, lot:'WAR-2025-008', expiry:'31/12/2569'
        }
    ];

    function ovSelectPt(idx, navigateToStep) {
        if (navigateToStep === undefined) navigateToStep = true;
        ovSelectedIdx = idx;
        const p = ovPatients[idx];
        if (!p) return;

        const banner2 = document.querySelector('#ovStep2 .ov-banner-text');
        if (banner2) banner2.textContent = p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' — ยาเลยเวลา ' + p.overdueText;
        const banner2Sub = document.querySelector('#ovStep2 .ov-banner-sub');
        if (banner2Sub) banner2Sub.textContent = 'ต้องยืนยันก่อนดำเนินการให้ยา';

        const step2Avatar = document.querySelector('#ovStep2 .pd-avatar');
        if (step2Avatar) step2Avatar.textContent = p.initials;
        const step2Name = document.querySelector('#ovStep2 .pd-pt-name');
        if (step2Name) step2Name.textContent = p.name;
        const step2Meta = document.querySelector('#ovStep2 .pd-pt-meta');
        if (step2Meta) step2Meta.innerHTML = '<span>HN: ' + p.hn + '</span><span>เตียง ' + p.bed + '</span><span>' + p.gender + ', ' + p.age + ' ปี</span>';
        const step2DrugName = document.querySelector('#ovStep2 .rt-drug-name');
        if (step2DrugName) {
            step2DrugName.innerHTML = p.drug + ' <span class="pt-badge" style="background:#fff1f2;color:#be123c;font-size:9px;">Overdue</span>' + (p.isHighAlert ? '<span class="pt-badge high-alert" style="font-size:8px;">High Alert</span>' : '');
        }
        const step2DrugSub = document.querySelector('#ovStep2 .rt-drug-sub');
        if (step2DrugSub) step2DrugSub.textContent = p.route + ' · ' + p.dose + ' · ควรให้เวลา ' + p.dueTime;
        const step2Overdue = document.querySelector('#ovStep2 .rt-drug-info > div[style*="font-size:13px"][style*="font-weight:700"]');
        if (step2Overdue) step2Overdue.textContent = p.overdueSummary;

        const step3Sub = document.querySelector('#ovStep3 [style*="font-size:14px;color:var(--text-2)"]');
        if (step3Sub) step3Sub.textContent = p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' · ' + p.bed;

        const warnTimer = document.querySelector('#ovStep4 .ov-timer-big');
        if (warnTimer) {
            warnTimer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + p.overdueSummary;
        }
        const warnDesc = document.querySelector('#ovStep4 .ov-warn-card > div[style*="font-size:14px;color:#881337"]');
        if (warnDesc) warnDesc.innerHTML = p.drug + ' ' + p.route + ' — ควรให้เวลา <strong>' + p.dueTime + '</strong>';

        const step5BannerTitle = document.querySelector('#ovStep5 .ov-banner-text');
        if (step5BannerTitle) step5BannerTitle.textContent = 'สแกนยา Overdue — ' + p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' (' + p.bed + ')';
        const step5BannerSub = document.querySelector('#ovStep5 .ov-banner-sub');
        if (step5BannerSub) step5BannerSub.textContent = 'สแกนยาครบทุกรายการเพื่อยืนยัน';

        const step6Values = document.querySelectorAll('#ovStep6 .rec-grid .wit-mv');
        if (step6Values[0]) step6Values[0].textContent = p.name;
        if (step6Values[1]) step6Values[1].textContent = p.hn + ' · ' + p.bed;
        if (step6Values[3]) step6Values[3].textContent = p.dueTime;
        if (step6Values[4]) step6Values[4].textContent = p.overdueText;
        const successValues = document.querySelectorAll('#ovStep7 .ok-summary-grid .wit-mv');
        if (successValues[2]) successValues[2].textContent = p.overdueText;

        ovResetScan3();
        syncMultiDrugCards('ov', getCurrentFlowDrugs('ov'));
        if (navigateToStep) ovGoStep(2);
    }

    function ovGoStep(n) {
        ovCurrentStep = n;
        for(let i=1;i<=7;i++){const p=document.getElementById('ovStep'+i);if(p)p.classList.toggle('active',i===n);}
        document.querySelectorAll('#ovStepper .rt-step').forEach(s=>{const sn=parseInt(s.dataset.s);s.classList.remove('active','done');if(sn===n)s.classList.add('active');else if(sn<n)s.classList.add('done');});
        document.querySelectorAll('#ovStepper .rt-step-line').forEach((l,i)=>l.classList.toggle('done',i<n-1));
        const patient = getCurrentFlowPatient('ov') || {};
        const drugs = getFlowDrugText('ov');
        const patientLine = patient.name ? patient.name + ' (' + patient.bed + ')' : '';
        if(n===6){
            const el=document.getElementById('ovConfirmDrug');if(el)el.textContent=drugs;
        }
        if(n===7){
            document.getElementById('ovGivenTime').textContent=new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})+' น.';
            const sub=document.getElementById('ovSuccessSub');if(sub)sub.textContent=drugs + (patientLine ? ' — ' + patientLine : '');
            const drugEl=document.getElementById('ovSuccessDrug');if(drugEl)drugEl.textContent=drugs;
        }
    }

    function ovBack(){if(ovCurrentStep>1)ovGoStep(ovCurrentStep-1);else nav('pg-dashboard');}

    function ovScanPt(){
        document.getElementById('ovScan3C').className='rt-scan-circle ok';
        document.getElementById('ovScan3I').style.color='var(--green)';
        document.getElementById('ovScan3H').textContent='ยืนยันตัวตนสำเร็จ';
        document.getElementById('ovScan3H').style.color='var(--green-dark)';
        document.getElementById('ovScan3Btn').style.display='none';
        document.getElementById('ovStep3Bot').style.display='';
        showToast('สแกนผู้ป่วยสำเร็จ');setTimeout(()=>showToast(''),1500);
    }
    function ovResetScan3(){
        document.getElementById('ovScan3C').className='rt-scan-circle idle';
        document.getElementById('ovScan3I').style.color='var(--text-3)';
        document.getElementById('ovScan3H').textContent='สแกนยืนยันตัวผู้ป่วย';
        document.getElementById('ovScan3H').style.color='';
        document.getElementById('ovScan3Btn').style.display='';
        document.getElementById('ovStep3Bot').style.display='none';
    }

    function ovScanDrug(){
        document.getElementById('ovDrugResult').classList.add('show');
        ['ovRD','ovRDs','ovRR'].forEach(id=>{ const el = document.getElementById(id); if (el) el.className='rt-r pass'; });
        document.getElementById('ovBtnConfirm').disabled=false;
        showToast('สแกนยาสำเร็จ — 7 Rights ผ่าน (Time เป็น Overdue)');setTimeout(()=>showToast(''),2000);
    }

    /* ── Omit flow (Page 23) ── */
    let omCurrentStep = 1;
    let omSelectedReason = null;
    let omSelectedIdx = 0;
    let omSelectedDrugIdx = 0;

    function omGetPatients() {
        return getRoutineDispensePatientKeys().map(function(key) {
            const pt = patientData[key];
            const drugs = getRoutineDispenseDrugs(pt).filter(function(d) { return !d.done; });
            return { key:key, pt:pt, drugs:drugs };
        }).filter(function(row) { return row.pt && row.drugs.length > 0; });
    }

    function omDrugView(row, idx) {
        return legacyDrugView(row.drugs[idx] || row.drugs[0] || {}, row.pt, idx);
    }

    function omRenderList() {
        const inner = document.querySelector('#omStep1 .rt-inner');
        if (!inner) return;
        const rows = omGetPatients();
        const ward = currentWardName || DEFAULT_DEMO_WARD;
        const banner = '<div class="om-banner"><div class="om-banner-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="3"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="3"/></svg></div><div><div class="om-banner-text">งดให้ยา / Omit</div><div class="om-banner-sub">เลือกผู้ป่วยที่ต้องการบันทึกงดให้ยาใน ' + escHtml(ward) + '</div></div></div>';
        inner.innerHTML = banner + (rows.length ? rows.map(function(row, idx) {
            const firstView = legacyDrugView(row.drugs[0], row.pt, 0);
            return '<div class="rt-pt" onclick="omSelectPt(' + idx + ')" style="border-color:var(--border);"><div class="rt-pt-bar" style="background:#64748b;"></div><div class="rt-pt-info"><div class="rt-pt-name">' + escHtml(row.pt.name) + '</div><div class="rt-pt-meta">HN: ' + escHtml(row.pt.hn) + ' · เตียง ' + escHtml(row.pt.bed) + ' · ' + row.drugs.length + ' รายการยา</div></div><div class="rt-pt-right"><div class="rt-pt-time">' + escHtml(firstView.time === 'PRN' ? 'PRN' : firstView.time) + '</div></div></div>';
        }).join('') : '<div style="padding:24px;text-align:center;color:var(--text-3);background:white;border:1px dashed var(--border);border-radius:16px;">ไม่มีรายการยาปกติสำหรับงดให้ยาใน ' + escHtml(ward) + '</div>');
    }

    function omSelectPt(idx, navigateToStep) {
        if (navigateToStep === undefined) navigateToStep = true;
        const rows = omGetPatients();
        const row = rows[idx] || rows[0];
        if (!row) return;
        omSelectedIdx = rows.indexOf(row);
        omSelectedDrugIdx = 0;
        omSelectedReason = null;
        const pt = row.pt;
        const age = agePartsForFlow(pt);

        const step2Avatar = document.querySelector('#omStep2 .pd-avatar');
        if (step2Avatar) step2Avatar.textContent = pt.avatar || patientInitials(pt.name);
        const step2Name = document.querySelector('#omStep2 .pd-pt-name');
        if (step2Name) step2Name.textContent = pt.name;
        const step2Meta = document.querySelector('#omStep2 .pd-pt-meta');
        if (step2Meta) step2Meta.innerHTML = '<span>HN: ' + escHtml(pt.hn) + '</span><span>เตียง ' + escHtml(pt.bed) + '</span><span>' + escHtml(age.gender + ', ' + age.age + ' ปี') + '</span>';
        const step2Allergy = document.querySelector('#omStep2 .pd-allergy');
        if (step2Allergy) {
            step2Allergy.style.display = pt.allergy ? 'flex' : 'none';
            if (pt.allergy) step2Allergy.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' + escHtml(pt.allergy);
        }

        const fillDrugList = function(panelSelector, clickable) {
            const inner = document.querySelector(panelSelector + ' .rt-inner');
            if (!inner) return;
            inner.querySelectorAll('.rt-drug').forEach(function(el) { el.remove(); });
            const title = inner.querySelector('div[style*="font-size:15px"][style*="font-weight:700"]');
            if (title && panelSelector === '#omStep2') title.textContent = 'รายการยา — ' + escHtml(pt.round || 'รอบยา');
            row.drugs.forEach(function(drug, drugIdx) {
                const view = legacyDrugView(drug, pt, drugIdx);
                const card = document.createElement('div');
                card.className = 'rt-drug' + (clickable && drugIdx === omSelectedDrugIdx ? ' active' : '');
                if (clickable) {
                    card.style.cursor = 'pointer';
                    card.setAttribute('onclick', 'omPickDrug(this)');
                    card.dataset.drugIdx = String(drugIdx);
                }
                card.innerHTML = '<div class="rt-drug-bar wait"></div><div class="rt-drug-info"><div class="rt-drug-name">' + escHtml(view.name) + '</div><div class="rt-drug-sub">' + escHtml(view.routeShort + ' · ' + view.dose + ' · ' + (view.time === 'PRN' ? 'PRN' : view.time + ' น.')) + '</div></div>' + (clickable ? '<div class="rt-drug-right"><span class="am-drug-st wait" style="font-size:11px;">รอให้ยา</span></div>' : '');
                inner.appendChild(card);
            });
        };
        fillDrugList('#omStep2', false);
        fillDrugList('#omStep4', true);

        const step3Sub = document.querySelector('#omStep3 [style*="font-size:14px;color:var(--text-2)"]');
        if (step3Sub) step3Sub.textContent = pt.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' · ' + pt.bed + ' · HN: ' + pt.hn;

        const saveBtn = document.getElementById('omBtnSave5');
        if (saveBtn) saveBtn.disabled = true;
        const reasonBtn = document.getElementById('omBtnReason');
        if (reasonBtn) reasonBtn.disabled = false;
        document.querySelectorAll('#omOptions .omit-opt').forEach(function(o) {
            o.classList.remove('chosen');
            const svg = o.querySelector('svg');
            if (svg) svg.style.display = 'none';
        });
        omUpdateSelectedDrugSummary();
        omResetScan3();
        if (navigateToStep) omGoStep(2);
    }

    function omGetSelectedRow() {
        const rows = omGetPatients();
        return rows[omSelectedIdx] || rows[0] || null;
    }

    function omUpdateSelectedDrugSummary() {
        const row = omGetSelectedRow();
        if (!row) return;
        const view = omDrugView(row, omSelectedDrugIdx);
        const pt = row.pt;
        const routeDose = view.routeShort + ' · ' + view.dose;
        const timeText = view.time === 'PRN' ? 'PRN' : view.time + ' น.';
        const freqText = view.freq || pt.round || '—';
        const gridValues = document.querySelectorAll('#omStep5 .omit-med-grid .wit-mv');
        if (gridValues[0]) gridValues[0].textContent = pt.name;
        if (gridValues[1]) gridValues[1].textContent = pt.hn + ' · ' + pt.bed;
        if (gridValues[2]) gridValues[2].textContent = view.name;
        if (gridValues[3]) gridValues[3].textContent = routeDose;
        if (gridValues[4]) gridValues[4].textContent = timeText;
        if (gridValues[5]) gridValues[5].textContent = freqText;
        const drugName = document.getElementById('omDrugName');
        if (drugName) drugName.textContent = view.name;
        const confirmVals = document.querySelectorAll('#omStep6 .rec-grid .wit-mv');
        if (confirmVals[0]) confirmVals[0].textContent = pt.name;
        if (confirmVals[1]) confirmVals[1].textContent = pt.hn + ' · ' + pt.bed;
        const confirmDrug = document.getElementById('omConfirmDrug');
        if (confirmDrug) confirmDrug.textContent = view.name;
        const okDrug = document.getElementById('omOkDrug');
        if (okDrug) okDrug.textContent = view.name;
        const successDrug = document.getElementById('omSuccessDrug');
        if (successDrug) successDrug.textContent = view.name + ' — ' + pt.name + ' (' + pt.bed + ')';
    }

    function omGoStep(n) {
        omCurrentStep = n;
        for(let i=1;i<=7;i++){const p=document.getElementById('omStep'+i);if(p)p.classList.toggle('active',i===n);}
        document.querySelectorAll('#omStepper .rt-step').forEach(s=>{const sn=parseInt(s.dataset.s);s.classList.remove('active','done');if(sn===n)s.classList.add('active');else if(sn<n)s.classList.add('done');});
        document.querySelectorAll('#omStepper .rt-step-line').forEach((l,i)=>l.classList.toggle('done',i<n-1));
        const row = omGetSelectedRow();
        const view = row ? omDrugView(row, omSelectedDrugIdx) : null;
        if(n===6){
            const name=view ? view.name : '—';
            document.getElementById('omConfirmDrug').textContent=name;
            document.getElementById('omConfirmReason').textContent=omSelectedReason||'—';
            const vals=document.querySelectorAll('#omStep6 .rec-grid .wit-mv');
            if(row && vals[0]) vals[0].textContent=row.pt.name;
            if(row && vals[1]) vals[1].textContent=row.pt.hn+' · '+row.pt.bed;
        }
        if(n===7){
            const name=view ? view.name : '—';
            document.getElementById('omOkDrug').textContent=name;
            document.getElementById('omSuccessDrug').textContent=name+(row ? ' — '+row.pt.name+' ('+row.pt.bed+')' : '');
            document.getElementById('omOkReason').textContent=omSelectedReason||'—';
        }
    }

    function omBack(){if(omCurrentStep>1)omGoStep(omCurrentStep-1);else nav('pg-dashboard');}

    function omScanPt(){
        document.getElementById('omScan3C').className='rt-scan-circle ok';
        document.getElementById('omScan3I').style.color='var(--green)';
        document.getElementById('omScan3H').textContent='ยืนยันตัวตนสำเร็จ';
        document.getElementById('omScan3H').style.color='var(--green-dark)';
        document.getElementById('omScan3Btn').style.display='none';
        document.getElementById('omStep3Bot').style.display='';
        showToast('สแกนผู้ป่วยสำเร็จ');setTimeout(()=>showToast(''),1500);
    }
    function omResetScan3(){
        document.getElementById('omScan3C').className='rt-scan-circle idle';
        document.getElementById('omScan3I').style.color='var(--text-3)';
        document.getElementById('omScan3H').textContent='สแกนยืนยันตัวผู้ป่วย';
        document.getElementById('omScan3H').style.color='';
        document.getElementById('omScan3Btn').style.display='';
        document.getElementById('omStep3Bot').style.display='none';
    }

    function omPickDrug(el){
        document.querySelectorAll('#omStep4 .rt-drug').forEach(d=>d.classList.remove('active'));
        el.classList.add('active');
        omSelectedDrugIdx = parseInt(el.dataset.drugIdx || '0', 10) || 0;
        document.getElementById('omBtnReason').disabled=false;
        omUpdateSelectedDrugSummary();
    }

    function omPickReason(el){
        document.querySelectorAll('#omOptions .omit-opt').forEach(o=>{o.classList.remove('chosen');o.querySelector('svg').style.display='none';});
        el.classList.add('chosen');el.querySelector('svg').style.display='';
        omSelectedReason=el.querySelector('.omit-opt-label').textContent;
        document.getElementById('omBtnSave5').disabled=false;
    }

    /* ── High Alert flow (Page 22) ── */
    let haCurrentStep = 1;
    let haSelectedIdx = 0;
    let haWitnessVerified = false;
    const haPatients = [
        {
            name:'นายสมชาย มานะ', initials:'สช', hn:'6401234', bed:'3A-01',
            gender:'ชาย', age:58, allergy:'Penicillin',
            drug:'Heparin 5000 units', dose:'5,000 units',
            route:'SC', routeTh:'SC (ฉีดใต้ผิวหนัง)', dueTime:'08:00 น.',
            detail:'SC · 5,000 units', lot:'HEP-2025-042', expiry:'30/09/2569'
        },
        {
            name:'นายธนกร วิเศษสิทธิ์', initials:'ธว', hn:'6405001', bed:'3A-10',
            gender:'ชาย', age:45, allergy:'-',
            drug:'Heparin 5000 units', dose:'5,000 units',
            route:'SC', routeTh:'SC (ฉีดใต้ผิวหนัง)', dueTime:'07:30 น.',
            detail:'SC · 5,000 units', lot:'HEP-2025-042', expiry:'30/09/2569'
        }
    ];

    function haRenderList() {
        const sub = document.getElementById('haStep1Sub');
        if (sub) sub.textContent = 'ผู้ป่วยที่มีคำสั่งยา High Alert ใน ' + (currentWardName || DEFAULT_DEMO_WARD);
        const count = document.getElementById('haStep1Count');
        if (count) count.textContent = haPatients.length;
        const list = document.getElementById('haPtList');
        if (!list) return;
        list.innerHTML = haPatients.length ? haPatients.map(function(p, idx) {
            const isStat = /STAT|ด่วน/i.test((p.nameHtml || '') + ' ' + (p.scanSub || ''));
            const accent = isStat ? '#DC2626' : '#D97706';
            const softBg = isStat ? '#FEF2F2' : '#FFFBEB';
            const softBd = isStat ? '#FECACA' : '#FDE68A';
            const softText = isStat ? '#991B1B' : '#92400E';
            const subText = p.drug + ' ' + p.route + ' · ' + (p.dose || '') + ' · ' + (p.dueTime || '—');
            return '<div onclick="haSelectPt(' + idx + ')" style="background:rgba(255,255,255,0.9);border:2px solid var(--border);border-radius:16px;padding:18px;cursor:pointer;transition:all .2s;box-shadow:var(--shadow);border-top:3px solid ' + accent + ';">'
                + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">'
                + '<div style="width:42px;height:42px;background:linear-gradient(135deg,#B45309,' + accent + ');border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;flex-shrink:0;box-shadow:0 3px 10px rgba(217,119,6,0.25);">' + escHtml(p.initials || patientInitials(p.name)) + '</div>'
                + '<div style="flex:1;"><div style="font-size:15px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + escHtml(p.name) + ' <span class="pt-badge high-alert" style="font-size:9px;">High Alert</span>' + (isStat ? '<span class="pt-badge stat" style="font-size:9px;">STAT</span>' : '') + '</div>'
                + '<div style="font-size:11px;color:var(--text-3);margin-top:2px;">HN: ' + escHtml(p.hn) + ' · เตียง ' + escHtml(p.bed) + '</div></div></div>'
                + '<div style="background:' + softBg + ';border:1px solid ' + softBd + ';border-radius:10px;padding:10px 12px;"><div style="font-size:12px;font-weight:600;color:' + softText + ';">' + escHtml(p.drug + ' ' + p.route) + '</div><div style="font-size:11px;color:' + accent + ';margin-top:2px;">' + escHtml(subText) + '</div></div>'
                + '</div>';
        }).join('') : '<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--text-3);background:white;border:1px dashed var(--border);border-radius:16px;">ไม่มีรายการ High Alert ใน ' + escHtml(currentWardName || DEFAULT_DEMO_WARD) + '</div>';
    }

    function haSelectPt(idx, navigateToStep) {
        if (navigateToStep === undefined) navigateToStep = true;
        haSelectedIdx = idx;
        const p = haPatients[idx];
        if (!p) return;

        const step2Avatar = document.querySelector('#haStep2 .pd-avatar');
        if (step2Avatar) step2Avatar.textContent = p.initials;
        const step2Name = document.querySelector('#haStep2 .pd-pt-name');
        if (step2Name) step2Name.textContent = p.name;
        const step2Meta = document.querySelector('#haStep2 .pd-pt-meta');
        if (step2Meta) step2Meta.innerHTML = '<span>HN: ' + p.hn + '</span><span>เตียง ' + p.bed + '</span><span>' + p.gender + ', ' + p.age + ' ปี</span>';
        const step2Allergy = document.querySelector('#haStep2 .pd-allergy');
        if (step2Allergy) {
            step2Allergy.style.display = p.allergy && p.allergy !== '-' ? 'flex' : 'none';
            if (p.allergy && p.allergy !== '-') {
                step2Allergy.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>แพ้ยา: ' + p.allergy;
            }
        }
        const step2DrugName = document.querySelector('#haStep2 .rt-drug-name');
        if (step2DrugName) step2DrugName.innerHTML = p.drug + ' <span class="pt-badge high-alert" style="font-size:9px;">High Alert</span>';
        const step2DrugSub = document.querySelector('#haStep2 .rt-drug-sub');
        if (step2DrugSub) step2DrugSub.textContent = p.route + ' · ' + p.dose + ' · OD · ' + p.dueTime;

        const step3Sub = document.querySelector('#haStep3 [style*="font-size:14px;color:var(--text-2)"]');
        if (step3Sub) step3Sub.textContent = p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' · ' + p.bed + ' · HN: ' + p.hn;

        const step4BannerTitle = document.querySelector('#haStep4 .ha-banner-text');
        if (step4BannerTitle) step4BannerTitle.textContent = 'สแกนยา High Alert — ' + p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' (' + p.bed + ')';
        const step4BannerSub = document.querySelector('#haStep4 .ha-banner-sub');
        if (step4BannerSub) step4BannerSub.textContent = 'สแกนยาครบทุกรายการก่อนเข้าสู่ขั้นตอนพยาน';

        const step5Sub = document.querySelector('#haStep5 .ha-shield-sub');
        if (step5Sub) step5Sub.textContent = p.drug + ' ' + p.route + ' · ' + p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim() + ' (' + p.bed + ')';

        const step6Values = document.querySelectorAll('#haStep6 .rec-grid .wit-mv');
        if (step6Values[0]) step6Values[0].textContent = p.name;
        if (step6Values[1]) step6Values[1].textContent = p.hn + ' · ' + p.bed;
        if (step6Values[3]) step6Values[3].textContent = p.route;

        haResetScan3();
        haWitnessVerified = false;
        const witResult = document.getElementById('haWitResult');
        if (witResult) witResult.classList.remove('show');
        const step5Bot = document.getElementById('haStep5Bot');
        if (step5Bot) step5Bot.style.display = 'none';
        syncMultiDrugCards('ha', getCurrentFlowDrugs('ha'));
        if (navigateToStep) haGoStep(2);
    }

    function haGoStep(n) {
        if (n >= 6 && !haWitnessVerified) {
            showToast('ต้องสแกนบัตรพยานก่อนยืนยันยา High Alert');
            setTimeout(()=>showToast(''), 1800);
            n = 5;
        }
        haCurrentStep = n;
        for(let i=1;i<=7;i++){const p=document.getElementById('haStep'+i);if(p)p.classList.toggle('active',i===n);}
        document.querySelectorAll('#haStepper .rt-step').forEach(s=>{const sn=parseInt(s.dataset.s);s.classList.remove('active','done');if(sn===n)s.classList.add('active');else if(sn<n)s.classList.add('done');});
        document.querySelectorAll('#haStepper .rt-step-line').forEach((l,i)=>l.classList.toggle('done',i<n-1));
        const patient = getCurrentFlowPatient('ha') || {};
        const drugs = getFlowDrugText('ha');
        const patientLine = patient.name ? patient.name + ' (' + patient.bed + ')' : '';
        if(n===6){
            const el=document.getElementById('haConfirmDrug');if(el)el.textContent=drugs+' (HA)';
        }
        if(n===7){
            document.getElementById('haGivenTime').textContent=new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})+' น.';
            const sub=document.getElementById('haSuccessSub');if(sub)sub.textContent=drugs + (patientLine ? ' — ' + patientLine : '') + ' · Double Check ครบถ้วน';
            const drugEl=document.getElementById('haSuccessDrug');if(drugEl)drugEl.textContent=drugs+' (HA)';
        }
    }

    function haBack(){if(haCurrentStep>1)haGoStep(haCurrentStep-1);else nav('pg-dashboard');}

    function haScanPt(){
        document.getElementById('haScan3C').className='rt-scan-circle ok';
        document.getElementById('haScan3I').style.color='var(--green)';
        document.getElementById('haScan3H').textContent='ยืนยันตัวตนสำเร็จ';
        document.getElementById('haScan3H').style.color='var(--green-dark)';
        document.getElementById('haScan3Btn').style.display='none';
        document.getElementById('haStep3Bot').style.display='';
        showToast('สแกนผู้ป่วยสำเร็จ');setTimeout(()=>showToast(''),1500);
    }

    function haResetScan3(){
        document.getElementById('haScan3C').className='rt-scan-circle idle';
        document.getElementById('haScan3I').style.color='var(--text-3)';
        document.getElementById('haScan3H').textContent='กรุณาสแกนสายรัดข้อมือผู้ป่วย';
        document.getElementById('haScan3H').style.color='';
        document.getElementById('haScan3Btn').style.display='';
        document.getElementById('haStep3Bot').style.display='none';
    }

    function haScanDrug(){
        document.getElementById('haDrugResult').classList.add('show');
        ['haRD','haRDs','haRR'].forEach(id=>{ const el = document.getElementById(id); if (el) el.className='rt-r pass'; });
        document.getElementById('haBtnWit').disabled=false;
        showToast('สแกนยาสำเร็จ — 7 Rights ผ่าน · ไปขั้นตอนพยาน');setTimeout(()=>showToast(''),2000);
    }

    function haWitness(){
        const currentItems = getCurrentFlowDrugs('ha');
        const drugs = currentItems.map(d => d.name).join(' · ') || 'High Alert Drug';
        const lotInfo = currentItems[0] ? currentItems[0].lot : '—';
        showHAVerifyModal(drugs, lotInfo, function() {
            haWitnessVerified = true;
            const witTime = document.getElementById('haWitTime');
            if (witTime) witTime.textContent = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
            const witResult = document.getElementById('haWitResult');
            if (witResult) witResult.classList.add('show');
            const step5Bot = document.getElementById('haStep5Bot');
            if (step5Bot) step5Bot.style.display = '';
            showToast('พยานยืนยันสำเร็จ'); setTimeout(()=>showToast(''), 1500);
        }, 'witness');
    }

    /* ── PRN flow (Page 21) — Dynamic Data ── */
    var prnPatients = [
        {
            name:'นายสมชาย มานะ', initials:'สช', hn:'6401234', bed:'3A-01',
            gender:'ชาย', age:58, allergy:'Penicillin',
            drug:'Morphine 5 mg', drugFull:'Morphine 5 mg/mL', dose:'5 mg',
            route:'IV', routeTh:'IV (หลอดเลือดดำ)', routeDesc:'ฉีดเข้าหลอดเลือดดำ',
            condition:'q4h PRN pain ≥ 5', interval:'q4h', intervalHrs:4,
            lastGiven:'03:00', hrsAgo:5,
            isHighAlert:true, isNarcotic:true, needWitness:true,
            lot:'MOR-2025-017', expiry:'15/06/2569',
            canGive:true, prnCount:1
        },
        {
            name:'นางสาวพิมพ์ใจ สุขสม', initials:'พส', hn:'6401567', bed:'3A-02',
            gender:'หญิง', age:34, allergy:'-',
            drug:'Paracetamol 500 mg', drugFull:'Paracetamol 500 mg', dose:'500 mg',
            route:'PO', routeTh:'PO (รับประทาน)', routeDesc:'รับประทาน',
            condition:'q4-6h PRN pain/fever', interval:'q4-6h', intervalHrs:4,
            lastGiven:'02:00', hrsAgo:6,
            isHighAlert:false, isNarcotic:false, needWitness:false,
            lot:'PCM-2025-203', expiry:'30/09/2570',
            canGive:true, prnCount:1
        },
        {
            name:'นายวิชัย ดีงาม', initials:'วด', hn:'6402890', bed:'3A-05',
            gender:'ชาย', age:45, allergy:'Sulfa',
            drug:'Tramadol 50 mg', drugFull:'Tramadol 50 mg', dose:'50 mg',
            route:'PO', routeTh:'PO (รับประทาน)', routeDesc:'รับประทาน',
            condition:'q6h PRN moderate pain', interval:'q6h', intervalHrs:6,
            lastGiven:'07:30', hrsAgo:0.5,
            isHighAlert:false, isNarcotic:false, needWitness:false,
            lot:'TRA-2025-089', expiry:'20/12/2569',
            canGive:false, prnCount:1
        }
    ];

    let prnCurrentStep = 1;
    let selectedPain = null;
    let prnSelectedIdx = 0;

    function ensurePrnPatientCards(count) {
        const inner = document.querySelector('#prnStep1 .rt-inner');
        if (!inner) return [];
        for (let i = 0; i < count; i++) {
            if (document.getElementById('prnPtCard' + i)) continue;
            const card = document.createElement('div');
            card.className = 'prn-pt';
            card.id = 'prnPtCard' + i;
            card.innerHTML = '<div class="prn-pt-bar"></div>'
                + '<div class="rt-pt-info">'
                + '<div class="rt-pt-name" style="display:flex;align-items:center;gap:6px;" id="prnPtName' + i + '"></div>'
                + '<div class="rt-pt-meta" id="prnPtMeta' + i + '"></div>'
                + '<div class="prn-interval ok" style="margin-top:6px;padding:4px 10px;display:inline-flex;" id="prnPtInterval' + i + '"></div>'
                + '</div>'
                + '<div class="rt-pt-right"><div class="rt-pt-time" id="prnPtCount' + i + '"></div></div>';
            inner.appendChild(card);
        }
        return [...document.querySelectorAll('[id^="prnPtCard"]')];
    }

    /* ── Render patient list (Step 1) ── */
    function prnRenderList() {
        var svgOk = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        var svgWait = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        const stepSub = document.querySelector('#prnStep1 .prn-banner-sub');
        if (stepSub) stepSub.textContent = 'แสดงผู้ป่วยที่มีคำสั่งยา PRN ใน ' + (currentWardName || DEFAULT_DEMO_WARD);
        ensurePrnPatientCards(prnPatients.length);
        document.querySelectorAll('[id^="prnPtCard"]').forEach(function(card, i) {
            card.style.display = i < prnPatients.length ? '' : 'none';
            card.style.opacity = '';
            card.style.pointerEvents = '';
            card.onclick = function() { prnSelectPt(i); };
        });
        prnPatients.forEach(function(p, i) {
            var card = document.getElementById('prnPtCard'+i);
            if (!card) return;
            // Name + badges
            var nameHtml = p.name + ' <span class="pt-badge prn">PRN</span>';
            if (p.isHighAlert) nameHtml += '<span class="pt-badge halert" style="font-size:9px;padding:2px 7px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;">High Alert</span>';
            const nameEl = document.getElementById('prnPtName'+i);
            const metaEl = document.getElementById('prnPtMeta'+i);
            const countEl = document.getElementById('prnPtCount'+i);
            if (nameEl) nameEl.innerHTML = nameHtml;
            if (metaEl) metaEl.textContent = 'HN: '+p.hn+' · เตียง '+p.bed+' · '+p.drug+' '+p.route;
            // Interval
            var ivEl = document.getElementById('prnPtInterval'+i);
            if (p.canGive) {
                ivEl.className = 'prn-interval ok';
                ivEl.style.cssText = 'margin-top:6px;padding:4px 10px;display:inline-flex;';
                ivEl.innerHTML = svgOk + ' ให้ได้ (ล่าสุด '+p.lastGiven+' น. · ผ่าน '+p.hrsAgo+' ชม.)';
            } else {
                ivEl.className = 'prn-interval wait';
                ivEl.style.cssText = 'margin-top:6px;padding:4px 10px;display:inline-flex;';
                var remain = p.intervalHrs - p.hrsAgo;
                ivEl.innerHTML = svgWait + ' ยังให้ไม่ได้ (ให้ล่าสุด '+p.lastGiven+' น. · เหลืออีก '+remain+' ชม.)';
            }
            if (countEl) countEl.textContent = p.canGive ? p.prnCount+' ยา PRN' : 'รอ interval';
            // Disable card if can't give
            var bar = card.querySelector('.prn-pt-bar');
            if (!p.canGive) {
                card.style.opacity = '.55';
                card.style.pointerEvents = 'none';
                card.onclick = null;
                if (bar) bar.style.background = 'var(--text-3)';
                if (countEl) countEl.style.color = 'var(--text-3)';
            } else {
                if (bar) bar.style.background = '';
                if (countEl) countEl.style.color = '';
            }
        });
    }

    /* ── Select patient & populate all steps ── */
    function prnSelectPt(idx, navigateToStep) {
        if (navigateToStep === undefined) navigateToStep = true;
        prnSelectedIdx = idx;
        var p = prnPatients[idx];
        if (!p) return;
        selectedPain = null;

        // Step 2 — Patient detail
        document.getElementById('prnAvatar2').textContent = p.initials;
        document.getElementById('prnDetailName2').textContent = p.name;
        document.getElementById('prnDetailMeta2').innerHTML = '<span>HN: '+p.hn+'</span><span>เตียง '+p.bed+'</span><span>'+p.gender+', '+p.age+' ปี</span>';
        document.getElementById('prnAllergyText2').textContent = 'แพ้ยา: '+p.allergy;
        if (p.allergy === '-') document.getElementById('prnDetailAllergy2').style.display = 'none';
        else document.getElementById('prnDetailAllergy2').style.display = '';

        // Step 2 — Drug card
        var dnHtml = p.drug + ' <span class="pt-badge prn" style="font-size:9px;padding:1px 6px;">PRN</span>';
        if (p.isHighAlert) dnHtml += '<span class="pt-badge halert" style="font-size:8px;padding:1px 5px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;">High Alert</span>';
        document.getElementById('prnDrugName2').innerHTML = dnHtml;
        document.getElementById('prnDrugSub2').textContent = p.route+' · '+p.routeDesc+' · '+p.condition;
        var tagsHtml = '';
        if (p.needWitness) tagsHtml += '<span class="pt-badge" style="background:#fef2f2;color:#dc2626;font-size:9px;">ต้องมีพยาน</span>';
        if (p.isNarcotic) tagsHtml += '<span class="pt-badge" style="background:#faf5ff;color:#7c3aed;font-size:9px;">ยาเสพติด</span>';
        document.getElementById('prnDrugTags2').innerHTML = tagsHtml;
        var svgOk2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        document.getElementById('prnDrugInterval2').innerHTML = svgOk2+' ให้ได้ · ล่าสุด '+p.lastGiven+' น. (ผ่าน '+p.hrsAgo+' ชม.) · Interval: '+p.interval;

        // Step 3 — Scan subtitle
        document.getElementById('prnScan3Sub').textContent = p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim()+' · '+p.bed+' · HN: '+p.hn;

        // Step 4 — Banner
        document.getElementById('prnBannerSub4').textContent = p.drug+' '+p.route+' — '+p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim()+' ('+p.bed+')';

        // Step 5 — Drug detail (null-safe: step 5 now uses shared multi-drug scan cards)
        var prnEl;
        prnEl = document.getElementById('prnBannerSub5'); if (prnEl) prnEl.innerHTML = p.drug+' '+p.route+' · ข้อบ่งชี้: <span id="prnIndicText5">--</span> · Pain score: <span id="prnPainDisplay">--</span>/10';
        prnEl = document.getElementById('prnDrugName5'); if (prnEl) prnEl.innerHTML = p.drug+' <span class="pt-badge prn" style="font-size:10px;padding:2px 8px;">PRN</span>';
        prnEl = document.getElementById('prnDose5'); if (prnEl) prnEl.textContent = p.dose;
        prnEl = document.getElementById('prnRoute5'); if (prnEl) prnEl.textContent = p.routeTh;
        prnEl = document.getElementById('prnCondition5'); if (prnEl) prnEl.textContent = p.condition;
        prnEl = document.getElementById('prnLastGiven5'); if (prnEl) prnEl.textContent = p.lastGiven+' น. ('+p.hrsAgo+' ชม.ก่อน)';
        prnEl = document.getElementById('prnScanResultName'); if (prnEl) prnEl.textContent = p.drugFull;
        prnEl = document.getElementById('prnLot5'); if (prnEl) prnEl.textContent = p.lot;
        prnEl = document.getElementById('prnExpiry5'); if (prnEl) prnEl.textContent = p.expiry;

        // Step 6 — Success
        var shortName = p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim();
        document.getElementById('prnSuccessSub6').textContent = p.drug+' '+p.route+' — '+p.name+' ('+p.bed+')';
        document.getElementById('prnDrugSummary6').textContent = p.drug+' (PRN)';
        document.getElementById('prnNextDose6').textContent = 'หลัง '+p.intervalHrs+' ชม.';

        // Step 7 — Post-assessment
        prnEl = document.getElementById('prnBannerSub7'); if (prnEl) prnEl.textContent = p.drug+' '+p.route+' — '+shortName+' ('+p.bed+')';
        prnEl = document.getElementById('prnDrugName7'); if (prnEl) prnEl.innerHTML = p.drug+' <span class="pt-badge prn" style="font-size:10px;padding:2px 8px;">PRN</span>';
        prnEl = document.getElementById('prnRoute7'); if (prnEl) prnEl.textContent = p.routeTh;
        prnEl = document.getElementById('prnDose7'); if (prnEl) prnEl.textContent = p.dose;
        prnEl = document.getElementById('prnSuccessSub7'); if (prnEl) prnEl.textContent = p.drug+' '+p.route+' — '+p.name+' ('+p.bed+')';
        prnEl = document.getElementById('prnDrugSummary7'); if (prnEl) prnEl.textContent = p.drug+' (PRN)';

        document.getElementById('prnIndication').value = '';
        document.getElementById('prnReason').value = '';
        document.querySelectorAll('#painScale .pain-dot').forEach(function(dot) {
            dot.classList.remove('selected');
            dot.style.background = '';
            dot.style.borderColor = '';
        });
        prnResetScan3();
        checkPrnAssess();
        syncMultiDrugCards('prn', getCurrentFlowDrugs('prn'));
        if (navigateToStep) prnGoStep(2);
    }

    /* ── Step navigation ── */
    function prnGoStep(n) {
        prnCurrentStep = n;
        for (let i=1;i<=7;i++) { const p=document.getElementById('prnStep'+i); if(p) p.classList.toggle('active',i===n); }
        document.querySelectorAll('#prnStepper .rt-step').forEach(s => {
            const sn=parseInt(s.dataset.s); s.classList.remove('active','done');
            if(sn===n) s.classList.add('active'); else if(sn<n) s.classList.add('done');
        });
        document.querySelectorAll('#prnStepper .rt-step-line').forEach((l,i) => l.classList.toggle('done',i<n-1));
        if(n===5) {
            // Update indication & pain display from assessment
            var indicMap = {pain:'ปวด',nausea:'คลื่นไส้',fever:'ไข้',insomnia:'นอนไม่หลับ',anxiety:'กระวนกระวาย',other:'อื่นๆ'};
            var indVal = document.getElementById('prnIndication').value;
            var indicEl = document.getElementById('prnIndicText5');
            if (indicEl) indicEl.textContent = indicMap[indVal]||'--';
            var painEl = document.getElementById('prnPainDisplay');
            if (painEl) painEl.textContent = selectedPain!==null ? selectedPain : '--';
        }
        if(n===6) {
            document.getElementById('prnGivenTime').textContent = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})+' น.';
            const patient = getCurrentFlowPatient('prn') || {};
            // Populate indication summary
            var indicMap2 = {pain:'ปวด',nausea:'คลื่นไส้',fever:'ไข้',insomnia:'นอนไม่หลับ',anxiety:'กระวนกระวาย',other:'อื่นๆ'};
            var indVal2 = document.getElementById('prnIndication').value;
            document.getElementById('prnIndicSummary6').textContent = (indicMap2[indVal2]||'--') + (selectedPain!==null ? ' · Pain '+selectedPain+'/10' : '');
            // Populate drug names dynamically
            const prnDrugs = getFlowDrugText('prn');
            const patientLine = patient.name ? patient.name + ' (' + patient.bed + ')' : '';
            var subEl = document.getElementById('prnSuccessSub6'); if(subEl) subEl.textContent = prnDrugs + (patientLine ? ' — ' + patientLine : '');
            var drugEl = document.getElementById('prnDrugSummary6'); if(drugEl) drugEl.textContent = prnDrugs + ' (PRN)';
        }
        if(n===7) {
            var p7El = document.getElementById('prnPostAssessForm'); if (p7El) p7El.style.display='';
            p7El = document.getElementById('prnPostAssessSuccess'); if (p7El) p7El.style.display='none';
            p7El = document.getElementById('prnStep7Bot'); if (p7El) p7El.style.display='';
            p7El = document.getElementById('postAssessTime'); if (p7El) p7El.value = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})+' น.';
            var gtEl = document.getElementById('prnGivenTime');
            var gt = gtEl ? gtEl.textContent : '';
            p7El = document.getElementById('prnPostGivenTime'); if (p7El) p7El.textContent = gt;
            // Indication for step 7
            var indicMap3 = {pain:'ปวด',nausea:'คลื่นไส้',fever:'ไข้',insomnia:'นอนไม่หลับ',anxiety:'กระวนกระวาย',other:'อื่นๆ'};
            var indVal3 = document.getElementById('prnIndication').value;
            p7El = document.getElementById('prnIndic7'); if (p7El) p7El.textContent = (indicMap3[indVal3]||'--') + (selectedPain!==null ? ' · Pain '+selectedPain+'/10' : '');
            p7El = document.getElementById('prnPrePainSummary7'); if (p7El) p7El.textContent = selectedPain!==null ? selectedPain+'/10' : '--';
        }
    }

    function prnBack() { if(prnCurrentStep>1) prnGoStep(prnCurrentStep-1); else nav('pg-dashboard'); }

    function prnScanPt() {
        document.getElementById('prnScan3C').className='rt-scan-circle ok';
        document.getElementById('prnScan3I').style.color='var(--green)';
        document.getElementById('prnScan3H').textContent='ยืนยันตัวตนสำเร็จ';
        document.getElementById('prnScan3H').style.color='var(--green-dark)';
        document.getElementById('prnScan3Btn').style.display='none';
        document.getElementById('prnStep3Bot').style.display='';
        showToast('สแกนผู้ป่วยสำเร็จ'); setTimeout(()=>showToast(''),1500);
    }

    function prnResetScan3() {
        document.getElementById('prnScan3C').className='rt-scan-circle idle';
        document.getElementById('prnScan3I').style.color='var(--text-3)';
        document.getElementById('prnScan3H').textContent='กรุณาสแกนสายรัดข้อมือผู้ป่วย';
        document.getElementById('prnScan3H').style.color='';
        document.getElementById('prnScan3Btn').style.display='';
        document.getElementById('prnStep3Bot').style.display='none';
    }

    function pickPain(el, score) {
        selectedPain = score;
        document.querySelectorAll('#painScale .pain-dot').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        const colors = ['#22c55e','#22c55e','#84cc16','#eab308','#eab308','#f97316','#f97316','#ef4444','#ef4444','#dc2626','#dc2626'];
        el.style.background = colors[score];
        el.style.borderColor = colors[score];
        checkPrnAssess();
    }

    function checkPrnAssess() {
        const indication = document.getElementById('prnIndication').value;
        const reason = document.getElementById('prnReason').value.trim();
        document.getElementById('btnPrnAssess').disabled = !(indication && selectedPain !== null);
    }

    // Attach listeners
    document.addEventListener('DOMContentLoaded', () => {
        const ind = document.getElementById('prnIndication');
        const rea = document.getElementById('prnReason');
        if(ind) ind.addEventListener('change', checkPrnAssess);
        if(rea) rea.addEventListener('input', checkPrnAssess);
        prnRenderList();
        prnSelectPt(0, false);
    });

    function prnScanDrug() {
        var p = prnPatients[prnSelectedIdx];
        var drugName = p.drug;
        if (isHighAlertDrug(drugName)) {
            var lotInfo = drugLotMap[drugName] || { lot: p.lot };
            showHAVerifyModal(drugName, lotInfo.lot, function() {
                prnDoScanDrug();
                showToast('พยานยืนยัน High Alert สำเร็จ — ' + drugName);
                setTimeout(function(){ showToast(''); }, 2000);
            }, 'witness');
            return;
        }
        prnDoScanDrug();
    }
    function prnDoScanDrug() {
        document.getElementById('prnDrugResult').classList.add('show');
        ['prnRD','prnRDs','prnRR'].forEach(id => { const el = document.getElementById(id); if (el) el.className='rt-r pass'; });
        document.getElementById('btnPrnConfirm').disabled=false;
        showToast('สแกนยา PRN สำเร็จ — 7 Rights ผ่าน'); setTimeout(()=>showToast(''),1500);
    }

    /* ── Post-medication assessment (Step 7) ── */
    let selectedPostPain = null;

    function selectPostPain(val) {
        selectedPostPain = val;
        document.querySelectorAll('#postPainScale .pain-dot').forEach((d,i) => {
            d.classList.toggle('selected', i === val);
        });
        var cmp = document.getElementById('postPainCompare');
        var txt = document.getElementById('postPainCompareText');
        cmp.style.display = '';
        var prePain = selectedPain !== null ? selectedPain : 0;
        var diff = prePain - val;
        if (diff > 0) {
            txt.textContent = 'Pain ลดลง ' + diff + ' คะแนน (จาก ' + prePain + ' → ' + val + ')';
            txt.style.color = 'var(--green)';
        } else if (diff < 0) {
            txt.textContent = 'Pain เพิ่มขึ้น ' + Math.abs(diff) + ' คะแนน (จาก ' + prePain + ' → ' + val + ')';
            txt.style.color = '#dc2626';
        } else {
            txt.textContent = 'Pain คงเดิม (' + prePain + ' → ' + val + ')';
            txt.style.color = 'var(--text-3)';
        }
        checkPostAssess();
    }

    function handleNoSideEffect(cb) {
        if (cb.checked) {
            document.querySelectorAll('.post-side-effects input[type="checkbox"]').forEach(c => {
                if (c !== cb) c.checked = false;
            });
        }
        checkPostAssess();
    }

    function handleSideEffectCheck(cb) {
        if (cb.checked) {
            var noCb = document.querySelector('.post-side-effects input[value="none"]');
            if (noCb) noCb.checked = false;
        }
        checkPostAssess();
    }

    function toggleSideEffect(label) {}

    function checkPostAssess() {
        var response = document.getElementById('prnResponseLevel').value;
        var hasSideEffect = document.querySelectorAll('.post-side-effects input:checked').length > 0;
        var hasTime = document.getElementById('postAssessTime').value.trim() !== '';
        var canSubmit = (selectedPostPain !== null && response !== '' && hasSideEffect && hasTime);
        document.getElementById('btnPostAssess').disabled = !canSubmit;
    }

    function submitPostAssess() {
        var prePain = selectedPain !== null ? selectedPain : 0;
        document.getElementById('postPainResult').textContent = selectedPostPain + '/10';
        var diff = prePain - selectedPostPain;
        if (diff > 0) {
            document.getElementById('postPainResult').style.color = 'var(--green)';
            document.getElementById('postPainResult').textContent = selectedPostPain + '/10 (↓' + diff + ')';
        } else if (diff < 0) {
            document.getElementById('postPainResult').style.color = '#dc2626';
            document.getElementById('postPainResult').textContent = selectedPostPain + '/10 (↑' + Math.abs(diff) + ')';
        } else {
            document.getElementById('postPainResult').style.color = 'var(--text-2)';
            document.getElementById('postPainResult').textContent = selectedPostPain + '/10 (คงเดิม)';
        }

        var respMap = { excellent:'ตอบสนองดีมาก', good:'ตอบสนองดี', partial:'ตอบสนองเล็กน้อย', none:'ไม่ตอบสนอง', worse:'อาการแย่ลง' };
        document.getElementById('postResponseResult').textContent = respMap[document.getElementById('prnResponseLevel').value] || '--';

        var seChecked = [];
        var seMap = { none:'ไม่มี', nausea:'คลื่นไส้/อาเจียน', drowsy:'ง่วงซึม', rash:'ผื่น/ลมพิษ', breathing:'หายใจลำบาก', hypotension:'ความดันต่ำ', constipation:'ท้องผูก', other:'อื่นๆ' };
        document.querySelectorAll('.post-side-effects input:checked').forEach(c => { seChecked.push(seMap[c.value] || c.value); });
        document.getElementById('postSideEffectResult').textContent = seChecked.join(', ') || 'ไม่มี';

        document.getElementById('postTimeResult').textContent = document.getElementById('postAssessTime').value;

        document.getElementById('prnPostAssessForm').style.display = 'none';
        document.getElementById('prnPostAssessSuccess').style.display = '';
        document.getElementById('prnStep7Bot').style.display = 'none';

        showToast('บันทึกการประเมินหลังให้ยาสำเร็จ'); setTimeout(()=>showToast(''),2000);
    }

    /* ── STAT flow (Page 20) — Dynamic Data ── */
    var stPatients = [
        {
            name:'นายธนกร วิเศษสิทธิ์', initials:'ธว', hn:'6405001', bed:'3A-10',
            gender:'ชาย', age:45,
            drug:'Heparin 5000 units', drugShort:'Heparin 5000u', dose:'5,000 units',
            route:'SC', routeTh:'SC (ฉีดใต้ผิวหนัง)',
            orderTime:'07:25', elapsedMin:48, doctor:'นพ.สุรศักดิ์',
            isHighAlert:true, needWitness:true,
            lot:'HEP-2025-042', expiry:'30/09/2569',
            urgency:'high' // high=red, moderate=amber
        },
        {
            name:'นางกัลยา ชัยวงศ์', initials:'กช', hn:'6403012', bed:'3A-08',
            gender:'หญิง', age:62,
            drug:'Diazepam 5 mg', drugShort:'Diazepam 5mg', dose:'5 mg',
            route:'IV', routeTh:'IV (หลอดเลือดดำ)',
            orderTime:'08:05', elapsedMin:8, doctor:'พญ.นิภา',
            isHighAlert:false, needWitness:false,
            lot:'DZP-2025-118', expiry:'20/03/2570',
            urgency:'moderate'
        }
    ];

    let stCurrentStep = 1;
    let stTimerInterval = null;
    let stSelectedIdx = 0;

    /* ── Render patient list (Step 1) ── */
    function stRenderList() {
        const sub = document.getElementById('stStep1SubDyn');
        if (sub) sub.textContent = 'แสดงผู้ป่วยที่มีคำสั่งยา STAT ใน ' + (currentWardName || DEFAULT_DEMO_WARD);
        const count = document.getElementById('stStep1Count');
        if (count) count.textContent = stPatients.length;
        var html = '';
        stPatients.forEach(function(p, i) {
            var isHigh = p.urgency === 'high';
            var c1 = isHigh ? '#DC2626' : '#D97706';
            var c2 = isHigh ? '#EF4444' : '#F59E0B';
            var bc = isHigh ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)';
            var haBadge = p.isHighAlert ? '<span class="pt-badge high-alert" style="font-size:8px;padding:2px 7px;">High Alert</span>' : '';
            html += '<div class="stat-pt" onclick="stSelectPt('+i+')" style="border-color:'+bc+';">'
                + '<div class="rt-pt-info" style="padding-left:8px;">'
                + '<div class="rt-pt-name" style="display:flex;align-items:center;gap:8px;font-size:16px;">'
                + '<div style="width:40px;height:40px;background:linear-gradient(135deg,'+c1+','+c2+');border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0;box-shadow:0 3px 10px rgba(0,0,0,0.15);">'+p.initials+'</div>'
                + p.name
                + ' <span class="pt-badge stat" style="font-size:9px;padding:2px 8px;">STAT</span>'
                + haBadge
                + '</div>'
                + '<div class="rt-pt-meta" style="margin-top:4px;padding-left:48px;">HN: '+p.hn+' · เตียง '+p.bed+' · '+p.drugShort+' '+p.route+' · สั่งเมื่อ '+p.orderTime+' น.</div>'
                + '</div>'
                + '<div style="flex-shrink:0;text-align:center;">'
                + '<div style="background:linear-gradient(135deg,'+c1+','+c2+');color:white;padding:8px 14px;border-radius:12px;font-size:12px;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,0.12);">'
                + '<div style="font-size:16px;font-weight:800;">'+p.elapsedMin+' นาที</div>'
                + '<div style="font-size:9px;opacity:.8;">ผ่านมาแล้ว</div>'
                + '</div></div></div>';
        });
        document.getElementById('stPtList').innerHTML = html || '<div style="padding:24px;text-align:center;color:var(--text-3);background:white;border:1px dashed var(--border);border-radius:16px;">ไม่มีรายการ STAT ใน ' + escHtml(currentWardName || DEFAULT_DEMO_WARD) + '</div>';
    }

    /* ── Select patient & populate all steps ── */
    function stSelectPt(idx, navigateToStep) {
        if (navigateToStep === undefined) navigateToStep = true;
        stSelectedIdx = idx;
        var p = stPatients[idx];
        if (!p) return;
        var shortName = p.name.replace(/^(นาย|นาง|นางสาว)/,'').trim();

        // Step 2 — Banner
        document.getElementById('stBanner2Title').textContent = 'ยา STAT — สั่งเมื่อ '+p.orderTime+' น. (ผ่านมา '+p.elapsedMin+' นาที)';

        // Step 2 — Patient card
        document.getElementById('stAvatar2').textContent = p.initials;
        document.getElementById('stPtName2').textContent = p.name;
        document.getElementById('stPtMeta2').innerHTML = '<span style="background:#F1F5F9;padding:2px 8px;border-radius:6px;">HN: '+p.hn+'</span><span style="background:#F1F5F9;padding:2px 8px;border-radius:6px;">เตียง '+p.bed+'</span><span style="background:#F1F5F9;padding:2px 8px;border-radius:6px;">'+p.gender+', '+p.age+' ปี</span>';
        document.getElementById('stPtTags2').innerHTML = p.isHighAlert ? '<span style="background:linear-gradient(135deg,#FEF2F2,#FEE2E2);color:#DC2626;font-size:9px;font-weight:700;padding:3px 8px;border-radius:6px;border:1px solid #FECACA;">High Alert Drug</span>' : '';

        // Step 2 — Drug card
        var dnHtml = p.drug+' <span style="background:linear-gradient(135deg,#DC2626,#EF4444);color:white;font-size:8px;font-weight:800;padding:2px 8px;border-radius:5px;animation:pulse 2s infinite;">STAT</span>';
        if (p.isHighAlert) dnHtml += ' <span style="background:#FEF2F2;color:#DC2626;font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid #FECACA;">HA</span>';
        document.getElementById('stDrugName2').innerHTML = dnHtml;
        document.getElementById('stDrugSub2').textContent = p.routeTh+' · '+p.dose+' · สั่งโดย '+p.doctor+' · '+p.orderTime+' น.';
        var tagsHtml = '';
        if (p.needWitness) tagsHtml = '<span style="background:#FEF2F2;color:#DC2626;font-size:9px;font-weight:600;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>ต้องมีพยาน</span>';
        document.getElementById('stDrugTags2').innerHTML = tagsHtml;

        // Step 3 — Scan banner
        document.getElementById('stScan3Sub').textContent = shortName+' · '+p.bed+' · HN: '+p.hn;

        // Step 4 — Drug detail (null-safe: elements may not exist if step4 uses multi-drug cards)
        var s4;
        s4 = document.getElementById('stBanner4Sub'); if (s4) s4.textContent = p.drug+' '+p.route+' · '+shortName+' ('+p.bed+')';
        s4 = document.getElementById('stDrugName4'); if (s4) s4.innerHTML = p.drug+' <span class="pt-badge stat" style="font-size:10px;padding:2px 8px;">STAT</span>';
        s4 = document.getElementById('stDose4'); if (s4) s4.textContent = p.dose;
        s4 = document.getElementById('stRoute4'); if (s4) s4.textContent = p.routeTh;
        s4 = document.getElementById('stOrderTime4'); if (s4) s4.textContent = p.orderTime+' น. (STAT)';
        s4 = document.getElementById('stDoctor4'); if (s4) s4.textContent = p.doctor;
        s4 = document.getElementById('stWarnBox4'); if (s4) s4.style.display = p.isHighAlert ? '' : 'none';
        s4 = document.getElementById('stWarnText4'); if (s4 && p.isHighAlert) s4.innerHTML = '<strong>High Alert</strong> — ต้องมีพยาน (ระบบจะขอยืนยันพยานหลังสแกนยา)';
        s4 = document.getElementById('stScanName4'); if (s4) s4.textContent = p.drug;
        s4 = document.getElementById('stLot4'); if (s4) s4.textContent = p.lot;
        s4 = document.getElementById('stExpiry4'); if (s4) s4.textContent = p.expiry;

        // Step 5 — Success
        document.getElementById('stSuccessSub5').textContent = p.drug+' '+p.route+' — '+p.name+' ('+p.bed+')';
        document.getElementById('stDrugSummary5').textContent = p.drug+' (STAT)';
        document.getElementById('stOrderSummary5').textContent = p.orderTime+' น.';
        document.getElementById('stElapsedSummary5').textContent = p.elapsedMin+' นาที';

        stResetScan3();
        syncMultiDrugCards('st', getCurrentFlowDrugs('st'));
        if (navigateToStep) stGoStep(2);
    }

    /* ── Step navigation ── */
    function stGoStep(n) {
        stCurrentStep = n;
        for (var i = 1; i <= 5; i++) {
            var p = document.getElementById('stStep' + i);
            if (p) p.classList.toggle('active', i === n);
        }
        document.querySelectorAll('#stStepper .rt-step').forEach(function(s) {
            var sn = parseInt(s.dataset.s);
            s.classList.remove('active','done');
            if (sn === n) s.classList.add('active');
            else if (sn < n) s.classList.add('done');
        });
        document.querySelectorAll('#stStepper .rt-step-line').forEach(function(l,i) { l.classList.toggle('done', i < n-1); });
        if (n === 5) {
            document.getElementById('stGivenTime').textContent = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) + ' น.';
            const patient = getCurrentFlowPatient('st') || {};
            const stDrugs = getFlowDrugText('st');
            const patientLine = patient.name ? patient.name + ' (' + patient.bed + ')' : '';
            var el;
            el = document.getElementById('stSuccessSub5'); if (el) el.textContent = stDrugs + (patientLine ? ' — ' + patientLine : '');
            el = document.getElementById('stDrugSummary5'); if (el) el.textContent = stDrugs + ' (STAT)';
        }
    }

    function stStepClick(n) {
        if (n <= stCurrentStep) stGoStep(n);
    }

    function stBack() {
        if (stCurrentStep > 1) stGoStep(stCurrentStep - 1);
        else nav('pg-dashboard');
    }

    function stScanPt() {
        document.getElementById('stScan3C').className = 'rt-scan-circle ok';
        document.getElementById('stScan3I').style.color = 'var(--green)';
        document.getElementById('stScan3H').textContent = 'ยืนยันตัวตนสำเร็จ';
        document.getElementById('stScan3H').style.color = 'var(--green-dark)';
        document.getElementById('stScan3T').textContent = 'พร้อมดำเนินการให้ยา STAT';
        document.getElementById('stScan3Btn').style.display = 'none';
        document.getElementById('stStep3Bot').style.display = '';
        showToast('สแกนผู้ป่วยสำเร็จ'); setTimeout(function(){ showToast(''); },1500);
    }

    function stResetScan3() {
        document.getElementById('stScan3C').className = 'rt-scan-circle idle';
        document.getElementById('stScan3I').style.color = 'var(--text-3)';
        document.getElementById('stScan3H').textContent = 'กรุณาสแกนสายรัดข้อมือผู้ป่วย';
        document.getElementById('stScan3H').style.color = '';
        document.getElementById('stScan3T').textContent = 'ยืนยันตัวตนก่อนให้ยา STAT';
        document.getElementById('stScan3Btn').style.display = '';
        document.getElementById('stStep3Bot').style.display = 'none';
    }

    function stScanDrug() {
        var p = stPatients[stSelectedIdx];
        if (p.isHighAlert) {
            showHAVerifyModal(p.drug, p.lot, function() {
                stDoScanDrug();
                showToast('พยานยืนยัน High Alert สำเร็จ — ' + p.drug);
                setTimeout(function(){ showToast(''); }, 2000);
            }, 'witness');
            return;
        }
        stDoScanDrug();
    }

    function stDoScanDrug() {
        document.getElementById('stDrugResult').classList.add('show');
        ['stRD','stRDs','stRR'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.className = 'rt-r pass';
        });
        document.getElementById('stBtnConfirm').disabled = false;
        showToast('สแกนยา STAT สำเร็จ — 7 Rights ผ่าน');
        setTimeout(function(){ showToast(''); }, 1500);
    }

    // Timer for elapsed
    function startStatTimer() {
        var p = stPatients[stSelectedIdx] || stPatients[0];
        var sec = (p ? p.elapsedMin : 48) * 60;
        function update() {
            sec++;
            var m = Math.floor(sec/60);
            var s = sec % 60;
            var el = document.getElementById('stElapsed');
            if (el) el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        }
        if (stTimerInterval) clearInterval(stTimerInterval);
        stTimerInterval = setInterval(update, 1000);
    }

    // Render list on load
    document.addEventListener('DOMContentLoaded', function() {
        stRenderList();
        stSelectPt(0, false);
    });

    /* ── Routine flow (Page 19) ── */
    let rtCurrentStep = 1;

    var rtRight6State = null; // null = pending, 'pass', 'fail'
    var rtRight7State = null;

    function rtSetRight(num, state) {
        if (num === 6) rtRight6State = state;
        if (num === 7) rtRight7State = state;

        // Update badge
        var badge = document.getElementById(num === 6 ? 'rtR6Doc' : 'rtR7Reason');
        if (badge) badge.className = 'rt-r ' + state;

        // Update wrap styling
        var wrap = document.getElementById(num === 6 ? 'rtR6Wrap' : 'rtR7Wrap');
        if (wrap) {
            wrap.style.borderColor = state === 'pass' ? '#86EFAC' : state === 'fail' ? '#FECACA' : '#E2E8F0';
            wrap.style.background = state === 'pass' ? '#F0FDF4' : state === 'fail' ? '#FEF2F2' : '#F8FAFC';
        }

        // Update button active states
        var passBtn = document.getElementById('rtR' + num + 'PassBtn');
        var failBtn = document.getElementById('rtR' + num + 'FailBtn');
        if (passBtn) {
            passBtn.style.background = state === 'pass' ? '#059669' : '#F0FDF4';
            passBtn.style.color = state === 'pass' ? 'white' : '#059669';
            passBtn.style.borderColor = state === 'pass' ? '#059669' : '#BBF7D0';
        }
        if (failBtn) {
            failBtn.style.background = state === 'fail' ? '#DC2626' : '#FEF2F2';
            failBtn.style.color = state === 'fail' ? 'white' : '#DC2626';
            failBtn.style.borderColor = state === 'fail' ? '#DC2626' : '#FECACA';
        }

        // Show/hide reason input for fail
        var reasonWrap = document.getElementById('rtR' + num + 'ReasonWrap');
        if (reasonWrap) reasonWrap.style.display = state === 'fail' ? '' : 'none';

        // Update save button
        rtUpdateSaveBtn();
    }

    function rtUpdateSaveBtn() {
        var btn = document.getElementById('rtBtnSaveRecord');
        if (!btn) return;
        var bothDecided = rtRight6State !== null && rtRight7State !== null;
        var anyFail = rtRight6State === 'fail' || rtRight7State === 'fail';

        btn.disabled = !bothDecided;
        if (!bothDecided) {
            btn.style.background = '#94a3b8';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> ยืนยัน 7 Rights · บันทึกผล';
        } else if (anyFail) {
            btn.style.background = 'linear-gradient(135deg,#D97706,#F59E0B)';
            btn.style.cursor = 'pointer';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2"/></svg> บันทึกพร้อมข้อยกเว้น';
        } else {
            btn.style.background = 'linear-gradient(135deg,#059669,#0D9488)';
            btn.style.cursor = 'pointer';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> ยืนยัน 7 Rights · บันทึกผล';
        }
    }

    function rtResetRight67() {
        rtRight6State = null;
        rtRight7State = null;
        ['rtR6Doc','rtR7Reason'].forEach(function(id){ var b = document.getElementById(id); if (b) b.className = 'rt-r pend'; });
        ['rtR6Wrap','rtR7Wrap'].forEach(function(id){ var w = document.getElementById(id); if (w) { w.style.borderColor = '#E2E8F0'; w.style.background = '#F8FAFC'; } });
        [6,7].forEach(function(n){
            var pb = document.getElementById('rtR'+n+'PassBtn'); if (pb) { pb.style.background = '#F0FDF4'; pb.style.color = '#059669'; pb.style.borderColor = '#BBF7D0'; }
            var fb = document.getElementById('rtR'+n+'FailBtn'); if (fb) { fb.style.background = '#FEF2F2'; fb.style.color = '#DC2626'; fb.style.borderColor = '#FECACA'; }
            var rw = document.getElementById('rtR'+n+'ReasonWrap'); if (rw) rw.style.display = 'none';
            var ri = document.getElementById('rtR'+n+'Reason'); if (ri) ri.value = '';
        });
        rtUpdateSaveBtn();
    }

    function rtGoStep(n) {
        // Partial scan warning — show modal before going to step 5
        if (n === 5) {
            var cards = [...document.querySelectorAll('.mdc[data-flow="r"]')].filter(function(c){ return c.style.display !== 'none'; });
            var total = cards.length;
            var doneCount = cards.filter(function(c){ return c.dataset.done === 'true'; }).length;
            var unscanned = total - doneCount;
            if (unscanned > 0 && !rtGoStep._partialConfirmed) {
                showPartialScanModal(unscanned, total, function(){
                    rtGoStep._partialConfirmed = true;
                    rtGoStep(5);
                });
                return;
            }
            rtGoStep._partialConfirmed = false;
            // Reset Right 6-7 state
            rtResetRight67();
        }

        // Build drug cards dynamically when entering Step 4
        if (n === 4 && typeof rtBuildDrugCards === 'function') rtBuildDrugCards();

        rtCurrentStep = n;
        // Update panels
        for (let i = 1; i <= 6; i++) {
            const panel = document.getElementById('rtStep' + i);
            if (panel) panel.classList.toggle('active', i === n);
        }
        // Update stepper
        document.querySelectorAll('#rtStepper .rt-step').forEach(s => {
            const sn = parseInt(s.dataset.s);
            s.classList.remove('active', 'done');
            if (sn === n) s.classList.add('active');
            else if (sn < n) s.classList.add('done');
        });
        document.querySelectorAll('#rtStepper .rt-step-line').forEach((line, idx) => {
            line.classList.toggle('done', idx < n - 1);
        });
        // Populate Step 5 & 6 with all scanned drug data
        if (n === 5 || n === 6) {
            const patient = getCurrentFlowPatient('r') || {};
            const scannedDrugs = getCurrentFlowDrugs('r');
            const allNames = scannedDrugs.map(d => d.name).join(' · ');
            const routeText = [...new Set(scannedDrugs.map(d => d.routeTh).filter(Boolean))].join(' · ') || '—';
            var el;
            // Step 5 — rebuild grid to show each drug's data
            if (n === 5) {
                const grid = document.getElementById('rtStep5Grid');
                if (grid) {
                    let drugRows = '';
                    scannedDrugs.forEach(function(sd, i) {
                        const rd = rtDrugs[i] || {};
                        const lotStr = sd.lot && sd.exp ? sd.lot + ' · ' + sd.exp : '—';
                        drugRows += '<div style="grid-column:1/-1;background:rgba(13,148,136,0.05);border-radius:8px;padding:8px 12px;margin:2px 0;">'
                            + '<div class="wit-ml">ยา ' + (i+1) + '</div>'
                            + '<div class="wit-mv" style="color:var(--green);font-size:14px;">' + sd.name + '</div>'
                            + '</div>'
                            + '<div><div class="wit-ml">Dose</div><div class="wit-mv">' + (rd.dose || '—') + '</div></div>'
                            + '<div><div class="wit-ml">Lot / Expiry</div><div class="wit-mv">' + lotStr + '</div></div>';
                    });
                    grid.innerHTML = '<div><div class="wit-ml">ผู้ป่วย</div><div class="wit-mv">' + (patient.name || '—') + '</div></div>'
                        + '<div><div class="wit-ml">HN / เตียง</div><div class="wit-mv">' + [patient.hn, patient.bed].filter(Boolean).join(' · ') + '</div></div>'
                        + drugRows
                        + '<div><div class="wit-ml">Route</div><div class="wit-mv">' + routeText + '</div></div>'
                        + '<div><div class="wit-ml">ผู้ให้ยา</div><div class="wit-mv">' + (sessionStorage.getItem('mcName') || 'นส.สมใจ ดีมาก') + '</div></div>'
                        + '<div><div class="wit-ml">สถานะ</div><div class="wit-mv" style="color:var(--green);">ให้ยาแล้ว</div></div>';
                }
            }
            // Step 6 — rebuild grid per drug
            el = document.getElementById('rtS6Sub'); if (el) el.textContent = allNames + (patient.name ? ' — ' + patient.name + ' (' + patient.bed + ')' : '');
            if (n === 6) {
                const grid6 = document.getElementById('rtStep6Grid');
                if (grid6) {
                    let drugRows6 = '';
                    scannedDrugs.forEach(function(sd, i) {
                        const rd = rtDrugs[i] || {};
                        const lotStr = sd.lot && sd.exp ? sd.lot + ' · ' + sd.exp : '—';
                        drugRows6 += '<div style="grid-column:1/-1;background:rgba(13,148,136,0.05);border-radius:8px;padding:8px 12px;margin:2px 0;">'
                            + '<div class="wit-ml">ยา ' + (i+1) + '</div>'
                            + '<div class="wit-mv" style="color:var(--green);font-size:14px;">' + sd.name + '</div>'
                            + '</div>'
                            + '<div><div class="wit-ml">Dose</div><div class="wit-mv">' + (rd.dose || '—') + '</div></div>'
                            + '<div><div class="wit-ml">Lot / Expiry</div><div class="wit-mv">' + lotStr + '</div></div>';
                    });
                    grid6.innerHTML = drugRows6
                        + '<div><div class="wit-ml">Route</div><div class="wit-mv">' + routeText + '</div></div>'
                        + '<div><div class="wit-ml">สถานะ</div><div class="wit-mv" style="color:var(--green);">ให้ยาแล้ว</div></div>'
                        + '<div><div class="wit-ml">ผู้บันทึก</div><div class="wit-mv">' + (sessionStorage.getItem('mcName') || 'นส.สมใจ ดีมาก') + '</div></div>';
                }
                // Render 7 Rights banner
                var banner6 = document.getElementById('rtS6RightsBanner');
                if (banner6) {
                    var anyFail = rtRight6State === 'fail' || rtRight7State === 'fail';
                    if (anyFail) {
                        var failDetails = [];
                        if (rtRight6State === 'fail') failDetails.push('Documentation: ' + (document.getElementById('rtR6Reason')?.value || 'ไม่ระบุ'));
                        if (rtRight7State === 'fail') failDetails.push('Reason: ' + (document.getElementById('rtR7Reason')?.value || 'ไม่ระบุ'));
                        banner6.innerHTML = '<div style="background:linear-gradient(135deg,#D97706,#F59E0B);border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 16px rgba(217,119,6,0.2);">'
                            +'<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2"/></svg>'
                            +'<div style="flex:1;">'
                            +'<div style="font-size:15px;font-weight:800;color:white;">บันทึกพร้อมข้อยกเว้น</div>'
                            +'<div style="font-size:10px;color:rgba(255,255,255,0.85);margin-top:2px;">' + failDetails.join(' · ') + '</div>'
                            +'</div></div>';
                    } else {
                        banner6.innerHTML = '<div style="background:linear-gradient(135deg,#059669,#0D9488);border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 16px rgba(5,150,105,0.2);">'
                            +'<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>'
                            +'<div style="flex:1;">'
                            +'<div style="font-size:15px;font-weight:800;color:white;">7 Rights ผ่านครบถ้วน</div>'
                            +'<div style="font-size:10px;color:rgba(255,255,255,0.75);margin-top:2px;">Patient · Drug · Dose · Route · Time · Documentation · Reason</div>'
                            +'</div>'
                            +'<div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">'
                            +'<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
                            +'</div></div>';
                    }
                }
            }
        }
        // Scroll top
        const panel = document.getElementById('rtStep' + n);
        if (panel) panel.scrollTop = 0;
    }

    function rtStepClick(n) {
        // Can click on done steps (go back) or current step
        if (n <= rtCurrentStep) rtGoStep(n);
    }

    function rtBack() {
        if (rtCurrentStep > 1) rtGoStep(rtCurrentStep - 1);
        else nav('pg-dashboard');
    }

    function rtScanPatient() {
        const circle = document.getElementById('rtScan3Circle');
        const icon = document.getElementById('rtScan3Icon');
        circle.className = 'rt-scan-circle ok';
        icon.style.color = 'var(--green)';
        document.getElementById('rtScan3Head').textContent = 'ยืนยันตัวตนสำเร็จ';
        document.getElementById('rtScan3Head').style.color = 'var(--green-dark)';
        document.getElementById('rtScan3Hint').textContent = 'ข้อมูลตรงกับผู้ป่วยเป้าหมาย';
        document.getElementById('rtScan3Btn').style.display = 'none';
        document.getElementById('rtStep3Bottom').style.display = '';
        showToast('สแกนผู้ป่วยสำเร็จ');
        setTimeout(() => showToast(''), 1500);
    }

    function rtScanPatientFail() {
        const circle = document.getElementById('rtScan3Circle');
        const icon = document.getElementById('rtScan3Icon');
        circle.className = 'rt-scan-circle fail';
        circle.style.cssText = (circle.style.cssText || '') + ';background:linear-gradient(135deg,#fef2f2,#fee2e2);border-color:#fca5a5;';
        icon.style.color = '#dc2626';
        document.getElementById('rtScan3Head').textContent = 'ผู้ป่วยไม่ตรงกัน';
        document.getElementById('rtScan3Head').style.color = '#dc2626';
        document.getElementById('rtScan3Hint').textContent = 'สแกนได้: นางมาลี สุขใจ · HN: 6404215 (ไม่ใช่ผู้ป่วยเป้าหมาย) — กรุณาตรวจสอบอีกครั้ง';
        document.getElementById('rtScan3Btn').style.display = 'none';
        const bottom = document.getElementById('rtStep3Bottom');
        bottom.style.display = '';
        const proceedBtn = document.getElementById('rtStep3ProceedBtn');
        if (proceedBtn) { proceedBtn.disabled = true; proceedBtn.style.opacity = '0.4'; proceedBtn.style.cursor = 'not-allowed'; }
        showToast('ผู้ป่วยไม่ตรงกัน — ไม่สามารถดำเนินการต่อได้');
        setTimeout(() => showToast(''), 2500);
    }

    function rtResetStep3() {
        document.getElementById('rtScan3Circle').className = 'rt-scan-circle idle';
        document.getElementById('rtScan3Circle').style.cssText = '';
        document.getElementById('rtScan3Icon').style.color = 'var(--text-3)';
        document.getElementById('rtScan3Head').textContent = 'กรุณาสแกนสายรัดข้อมือผู้ป่วย';
        document.getElementById('rtScan3Head').style.color = '';
        document.getElementById('rtScan3Hint').textContent = 'สแกนบาร์โค้ดที่สายรัดข้อมือเพื่อยืนยันตัวตน';
        document.getElementById('rtScan3Btn').style.display = '';
        document.getElementById('rtStep3Bottom').style.display = 'none';
        const proceedBtn = document.getElementById('rtStep3ProceedBtn');
        if (proceedBtn) { proceedBtn.disabled = false; proceedBtn.style.opacity = ''; proceedBtn.style.cursor = ''; }
    }

    // Dispense patient data
    // Build dispensePatients dynamically from patientData so data stays in sync
    const routeFullMap = { PO:'PO (รับประทาน)', IV:'IV (หลอดเลือดดำ)', SC:'SC (ฉีดใต้ผิวหนัง)', IM:'IM (เข้ากล้ามเนื้อ)' };
    const roundTimeMap = { 'รอบเช้า':'06:00–08:00 น.', 'รอบสาย':'09:00–11:00 น.', 'รอบเที่ยง':'11:00–13:00 น.', 'รอบบ่าย':'13:00–15:00 น.', 'รอบเย็น':'16:00–18:00 น.', 'รอบดึก':'20:00–22:00 น.' };

    function buildDispensePatients() {
        var result = {};
        Object.keys(patientData).forEach(function(key) {
            var pt = patientData[key];
            var round = pt.round || 'รอบเช้า';
            var roundTime = roundTimeMap[round] || '06:00–08:00 น.';
            var drugs = (pt.drugs || []).filter(function(d) {
                // exclude PRN-only drugs from routine dispense list
                var desc = String(d.desc || d.freq || '');
                return !/\bPRN\b/i.test(desc);
            }).map(function(d) {
                // parse dose and route from desc field e.g. "1 เม็ด · PO · OD เช้า"
                var parts = String(d.desc || '').split('·').map(function(s){ return s.trim(); });
                var doseStr = parts[0] || d.name || '';
                var routeRaw = parts[1] || 'PO';
                var freqStr = parts.slice(2).join(' · ') || '';
                var routeKey = routeRaw.replace(/\s.*/, '');
                var routeFull = routeFullMap[routeKey] || routeRaw;
                var time = /OD ก่อนนอน|ก่อนนอน/.test(freqStr) ? '20:00–22:00 น.' : roundTime;
                return {
                    name: d.name,
                    dose: doseStr,
                    route: routeFull,
                    time: time,
                    freq: freqStr || routeRaw,
                    highAlert: !!d.highAlert
                };
            });
            result[key] = {
                avatar: pt.avatar || patientInitials(pt.name),
                name: pt.name,
                hn: pt.hn,
                bed: pt.bed,
                age: pt.age,
                allergy: pt.allergy || '',
                tags: (pt.tags || []).slice(),
                round: round,
                drugs: drugs
            };
        });
        return result;
    }

    const dispensePatients = buildDispensePatients();

    let currentDispenseBed = '01';
    let rtPatientFilter = 'all';

    function routinePatientCardHtml(key, idx) {
        const pt = patientData[key];
        if (!pt) return '';
        const drugs = getRoutineDispenseDrugs(pt);
        const pending = drugs.filter(function(d) { return !d.done; }).length;
        const done = drugs.length - pending;
        const highAlert = drugs.some(isLegacyHighAlertDrug);
        const time = drugs[0] ? legacyRoundTime(pt, drugs[0]) : '—';
        const colors = ['#0D9488','#8B5CF6','#3B82F6','#F59E0B','#EC4899','#06B6D4','#EF4444','#14B8A6'];
        const color = pending === 0 ? '#16A34A' : (highAlert ? '#EF4444' : colors[idx % colors.length]);
        const soft = highAlert ? '#FEF2F2' : (pending === 0 ? '#F0FDF4' : '#EFF6FF');
        const progress = drugs.length ? Math.round((done / drugs.length) * 100) : 0;
        const statusText = pending === 0 ? 'จ่ายครบแล้ว' : (highAlert ? 'รอจ่าย · High Alert' : 'รอจ่าย');
        const preview = drugs.slice(0, 3).map(function(d, drugIdx) {
            return legacyDrugView(d, pt, drugIdx).name;
        }).join(' · ') + (drugs.length > 3 ? ' +' + (drugs.length - 3) : '');
        const allergyText = pt.allergy ? String(pt.allergy).replace(/^แพ้ยา:\s*/, '') : '';
        const badges = (highAlert ? '<span class="pt-badge high-alert">High Alert</span>' : '<span class="pt-badge normal">Routine</span>')
            + (allergyText ? '<span class="pt-badge" style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;">Allergy</span>' : '')
            + (pending === 0 ? '<span class="pt-badge" style="background:#f0fdf4;color:#15803d;border:1px solid #86efac;">Complete</span>' : '');
        const progressW = Math.round(progress);
        const doneColor = pending === 0 ? '#16A34A' : color;
        return '<div class="rt-patient-card" onclick="rtSelectPatient(\'' + escHtml(key) + '\')" '
            + 'data-name="' + escHtml(pt.name) + '" data-hn="' + escHtml(pt.hn) + '" data-bed="' + escHtml(pt.bed) + '" data-drugs="' + escHtml(preview) + '" data-status="' + (pending ? 'pending' : 'done') + '" data-highalert="' + (highAlert ? '1' : '0') + '" '
            + 'style="--rt-accent:' + color + ';--rt-soft:' + soft + ';--rt-progress:' + progress + '%;">'
            // Top strip already handled by ::before
            // Bed badge
            + '<div class="rt-bed-badge"><strong>' + escHtml(pt.bed) + '</strong><span>Bed</span></div>'
            // Main body
            + '<div class="rt-card-main">'
            + '<div class="rt-card-top">'
            + '<div class="rt-card-avatar">' + escHtml(pt.avatar || patientInitials(pt.name)) + '</div>'
            + '<div style="min-width:0;flex:1;">'
            + '<div class="rt-card-name">' + escHtml(pt.name) + '</div>'
            + '<div class="rt-card-meta">HN: ' + escHtml(pt.hn) + ' · ' + escHtml(pt.age || '') + '</div>'
            + '</div></div>'
            // Badges
            + '<div class="rt-card-badges">' + badges + (allergyText ? '<span style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:9px;font-weight:700;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:3px;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>แพ้: ' + escHtml(allergyText) + '</span>' : '') + '</div>'
            // Drug preview
            + '<div class="rt-card-preview"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:4px;color:var(--text-3);flex-shrink:0;"><rect x="6" y="2" width="12" height="20" rx="4"/><line x1="6" y1="12" x2="18" y2="12"/></svg>' + escHtml(preview || 'ไม่มีรายการยา') + '</div>'
            // Progress bar
            + '<div style="height:4px;background:rgba(226,232,240,0.6);border-radius:2px;overflow:hidden;margin-bottom:0;"><div style="height:100%;width:' + progressW + '%;background:' + doneColor + ';border-radius:2px;transition:width .4s;"></div></div>'
            + '</div>'
            // Footer
            + '<div class="rt-card-right">'
            + '<div class="rt-card-stat"><strong>' + (done) + '/' + drugs.length + '</strong><span style="margin-left:4px;">รายการ</span></div>'
            + '<div style="display:flex;align-items:center;gap:6px;">'
            + '<div class="rt-card-time"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:3px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + escHtml(time === 'PRN' ? 'PRN' : time) + '</div>'
            + '<div class="rt-card-status">' + escHtml(statusText) + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
    }

    function renderRoutinePatientSelectionPage() {
        const list = document.getElementById('rtPatientList');
        if (!list) return;
        const keys = getRoutineDispensePatientKeys().slice().sort(function(a, b) {
            const ptA = patientData[a] || {};
            const ptB = patientData[b] || {};
            return String(ptA.bed || a).localeCompare(String(ptB.bed || b), 'th', { numeric: true, sensitivity: 'base' });
        });
        const pendingPatients = keys.filter(function(key) {
            return getRoutineDispenseDrugs(patientData[key]).some(function(d) { return !d.done; });
        }).length;
        const highAlertPatients = keys.filter(function(key) {
            return getRoutineDispenseDrugs(patientData[key]).some(isLegacyHighAlertDrug);
        }).length;
        const sub = document.getElementById('rtStep1Sub');
        if (sub) sub.textContent = (currentWardName || DEFAULT_DEMO_WARD) + ' · รอบเช้า 06:00–08:00 น. · ' + pendingPatients + ' ผู้ป่วยรอจ่ายยา';
        const totalEl = document.getElementById('rtTotalPatients');
        if (totalEl) totalEl.textContent = keys.length;
        const pendingEl = document.getElementById('rtPendingPatients');
        if (pendingEl) pendingEl.textContent = pendingPatients;
        const highAlertEl = document.getElementById('rtHighAlertPatients');
        if (highAlertEl) highAlertEl.textContent = highAlertPatients;
        const rowsHtml = keys.map(function(key, idx) {
            return routinePatientCardHtml(key, idx);
        }).join('');
        list.innerHTML = rowsHtml || '<div class="rt-patient-empty">ไม่มีผู้ป่วยยาปกติใน Ward นี้ · ยา PRN อยู่ที่เมนูจ่ายยา PRN</div>';
        filterRoutinePatients();
    }

    function setRoutinePatientFilter(filter, el) {
        rtPatientFilter = filter || 'all';
        document.querySelectorAll('.rt-filter-chip').forEach(function(btn) {
            btn.classList.toggle('active', btn === el || btn.dataset.filter === rtPatientFilter);
        });
        filterRoutinePatients();
    }

    function filterRoutinePatients() {
        const search = document.getElementById('rtPatientSearch');
        const q = search ? search.value.trim().toLowerCase() : '';
        let visible = 0;
        document.querySelectorAll('#rtPatientList .rt-patient-card').forEach(function(card) {
            const hay = [card.dataset.name, card.dataset.hn, card.dataset.bed, card.dataset.drugs].join(' ').toLowerCase();
            const matchSearch = !q || hay.includes(q);
            const matchFilter = rtPatientFilter === 'all'
                || (rtPatientFilter === 'pending' && card.dataset.status === 'pending')
                || (rtPatientFilter === 'done' && card.dataset.status === 'done')
                || (rtPatientFilter === 'highalert' && card.dataset.highalert === '1');
            const show = matchSearch && matchFilter;
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        const visibleEl = document.getElementById('rtVisiblePatients');
        if (visibleEl) visibleEl.textContent = visible;
    }

    function rtSelectPatient(bedNum, navigateToStep) {
        if (navigateToStep === undefined) navigateToStep = true;
        var isNewPatient = bedNum !== currentDispenseBed;
        currentDispenseBed = bedNum;
        currentLegacyDispenseBed = patientData[bedNum] ? bedNum : currentLegacyDispenseBed;
        var pt = dispensePatients[bedNum];
        if (!pt) return;
        if (isNewPatient) rtDrugStates = {};
        rtDrugs.length = 0;
        pt.drugs.forEach(function(d) { rtDrugs.push(d); });
        rtActiveDrugIdx = 0;

        // Step 2: Patient hero
        var s2Avatar = document.getElementById('rtStep2Avatar');
        if (s2Avatar) s2Avatar.textContent = pt.avatar;
        var s2Name = document.getElementById('rtStep2Name');
        if (s2Name) s2Name.textContent = pt.name;
        var s2HN = document.getElementById('rtStep2HN');
        if (s2HN) s2HN.textContent = 'HN: ' + pt.hn;
        var s2Bed = document.getElementById('rtStep2Bed');
        if (s2Bed) s2Bed.textContent = 'เตียง ' + pt.bed;
        var s2Age = document.getElementById('rtStep2Age');
        if (s2Age) s2Age.textContent = pt.age;
        var s2Allergy = document.getElementById('rtStep2Allergy');
        if (s2Allergy) {
            s2Allergy.style.display = pt.allergy ? 'flex' : 'none';
            var s2AllergyText = document.getElementById('rtStep2AllergyText');
            if (s2AllergyText) s2AllergyText.textContent = pt.allergy || '';
        }
        var s2Warnings = document.getElementById('rtStep2Warnings');
        if (s2Warnings) {
            s2Warnings.innerHTML = pt.tags.map(function(t) { var cls = t === 'Fall Risk' ? 'fall' : 'allergy'; return '<span class="pd-warn-tag ' + cls + '">' + t + '</span>'; }).join('');
            s2Warnings.style.display = pt.tags.length ? 'flex' : 'none';
        }

        // Step 2: Drug list
        var drugTitleEl = document.getElementById('rtStep2DrugTitle');
        if (drugTitleEl) drugTitleEl.textContent = 'รายการยาปกติ — ' + pt.round + ' (' + pt.drugs.length + ' รายการ)';
        var drugContainer = document.querySelector('#rtStep2');
        var oldDrugs = drugContainer.querySelectorAll('.rt-drug');
        oldDrugs.forEach(function(d) { d.remove(); });
        var innerDiv = document.getElementById('rtStep2DrugList') || drugContainer.querySelector('.rt-inner') || drugContainer;
        pt.drugs.forEach(function(d, idx) {
            var state = rtDrugStates[idx];
            var div = document.createElement('div');
            if (state) {
                div.className = 'rt-drug ' + state.type + '-drug';
                var stLabel = state.type === 'hold' ? 'Hold ยา' : 'Omit ยา';
                var stClass = state.type === 'hold' ? 'hold' : 'omit';
                div.innerHTML = '<div class="rt-drug-bar ' + stClass + '"></div>'
                    + '<div class="rt-drug-info"><div class="rt-drug-name">' + d.name + haBadge(d.name) + '</div>'
                    + '<div class="rt-drug-sub">' + d.route + ' · ' + d.freq + '</div>'
                    + '<div style="font-size:10px;color:#92400e;margin-top:2px;">' + state.reason + '</div></div>'
                    + '<div class="rt-drug-right" style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">'
                    + '<span class="am-drug-st ' + stClass + '" style="font-size:11px;">' + stLabel + '</span>'
                    + (state.type === 'hold' ? '<button class="rt-hold-omit-btn resume" onclick="rtResumedrug(' + idx + ')">↩ Resume</button>' : '')
                    + '</div>';
            } else {
                div.className = 'rt-drug';
                div.innerHTML = '<div class="rt-drug-bar wait"></div>'
                    + '<div class="rt-drug-info"><div class="rt-drug-name">' + d.name + haBadge(d.name) + '</div>'
                    + '<div class="rt-drug-sub">' + d.route + ' · ' + d.freq + '</div></div>'
                    + '<div class="rt-drug-right" style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">'
                    + '<span class="am-drug-st wait" style="font-size:11px;">รอให้ยา</span>'
                    + '<div class="rt-drug-actions" style="display:flex;gap:5px;">'
                    + '<button class="rt-hold-omit-btn hold" onclick="rtOpenHoldOmit(' + idx + ',\'hold\')">Hold</button>'
                    + '<button class="rt-hold-omit-btn omit" onclick="rtOpenHoldOmit(' + idx + ',\'omit\')">Omit</button>'
                    + '</div></div>';
            }
            innerDiv.appendChild(div);
        });

        // Step 3: Patient info
        var s3Avatar = document.getElementById('rtStep3Avatar');
        if (s3Avatar) s3Avatar.textContent = pt.avatar;
        var s3Name = document.getElementById('rtStep3Name');
        if (s3Name) s3Name.textContent = pt.name;
        var s3Meta = document.getElementById('rtStep3Meta');
        if (s3Meta) s3Meta.textContent = 'HN: ' + pt.hn + ' · เตียง ' + pt.bed;
        var s3Bed = document.getElementById('rtStep3Bed');
        if (s3Bed) s3Bed.textContent = pt.bed;

        // Step 4: built dynamically by rtBuildDrugCards() when entering step 4
        var d0 = pt.drugs[0];

        // Step 5: Patient info
        var s5Pt = document.getElementById('rtS5Patient');
        if (s5Pt) s5Pt.textContent = pt.name;
        var s5HN = document.getElementById('rtS5HN');
        if (s5HN) s5HN.textContent = pt.hn + ' · ' + pt.bed;

        // Step 6: Sub
        var s6Sub = document.getElementById('rtS6Sub');
        if (s6Sub) s6Sub.textContent = (d0 ? d0.name : '') + ' — ' + pt.name + ' (' + pt.bed + ')';

        rtResetStep3();
        syncMultiDrugCards('r', getCurrentFlowDrugs('r'));
        rtRenderPrnSection(bedNum);
        if (navigateToStep) rtGoStep(2);
    }

    var rtDrugs = [];

    var rtDrugStates = {}; // { [idx]: { type:'hold'|'omit', reason:'' } }
    var rtHoldOmitTarget = null; // { type, idx }
    var rtHoldReasons = ['NPO / งดน้ำ-อาหาร','BP ต่ำ / ค่าผิดปกติ','ผู้ป่วยปฏิเสธ','รอแพทย์ยืนยัน','อาการแพ้สงสัย'];
    var rtOmitReasons = ['ผู้ป่วยปฏิเสธ','ให้ยาแล้วก่อนหน้า','ข้ามรอบนี้ตามแผน','ยาหมด / ไม่มีในสต็อก','อาการดีขึ้น'];

    function rtResumedrug(idx) {
        delete rtDrugStates[idx];
        rtSelectPatient(currentDispenseBed, false);
        rtBuildDrugCards();
    }

    // ── PRN Stock Store ──────────────────────────────────────────────────
    // key: bedNum + '|' + drugName  →  { qty: number, lastGiven: timestamp|null }
    var prnStockStore = (function() {
        var STORAGE_KEY = 'prnStockStore_ward3A';
        var defaults = {};
        Object.keys(patientData).forEach(function(bed) {
            (patientData[bed].drugs || []).filter(function(d){ return d.prn; }).forEach(function(d) {
                var key = bed + '|' + d.name;
                // default quantities per drug type
                var qty = 10; // tablets/units default
                if (/Morphine/i.test(d.name)) qty = 5;
                else if (/Insulin/i.test(d.name)) qty = 10;
                else if (/Lorazepam/i.test(d.name)) qty = 8;
                else if (/Ibuprofen/i.test(d.name)) qty = 10;
                defaults[key] = { qty: qty, lastGiven: null };
            });
        });
        try {
            var saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
            if (saved) {
                // merge defaults for any missing keys
                Object.keys(defaults).forEach(function(k){ if (!saved[k]) saved[k] = defaults[k]; });
                return saved;
            }
        } catch(e) {}
        return defaults;
    })();

    function prnStockSave() {
        try { sessionStorage.setItem('prnStockStore_ward3A', JSON.stringify(prnStockStore)); } catch(e) {}
    }

    // ── Cart PRN Stock UI ─────────────────────────────────────────────
    var cartHaUnlocked = false;
    var cartPinValue = '';
    var CART_HA_PIN = '1234';

    function cartShowTab(tab) {
        // Handle page-level tabs (info vs prn)
        if (tab === 'info' || tab === 'prn') {
            var isInfo = tab === 'info';
            var cartTabInfo = document.getElementById('cartTabInfo');
            var cartTabPrn = document.getElementById('cartTabPrn');
            if (cartTabInfo) cartTabInfo.style.cssText = isInfo
                ? 'flex:1;padding:9px 0;border-radius:10px;border:none;font-size:13px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;background:white;color:#0F766E;box-shadow:0 1px 6px rgba(0,0,0,0.08);'
                : 'flex:1;padding:9px 0;border-radius:10px;border:none;font-size:13px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;background:transparent;color:var(--text-2);';
            if (cartTabPrn) cartTabPrn.style.cssText = isInfo
                ? 'flex:1;padding:9px 0;border-radius:10px;border:none;font-size:13px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;background:transparent;color:var(--text-2);'
                : 'flex:1;padding:9px 0;border-radius:10px;border:none;font-size:13px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;background:white;color:#7C3AED;box-shadow:0 1px 6px rgba(0,0,0,0.08);';
            var prnSection = document.getElementById('cartPrnSection');
            if (prnSection) prnSection.style.display = isInfo ? 'none' : 'block';
            var hero = document.querySelector('#pg-cart .p1-hero');
            if (hero) hero.style.display = isInfo ? '' : 'none';
            if (!isInfo) cartRenderPrnStock();
            return;
        }
        // Handle PRN panel internal tabs (general vs ha)
        var isGeneral = tab === 'general';
        var generalPanel = document.getElementById('cartPrnGeneralPanel');
        var haPanel = document.getElementById('cartPrnHaPanel');
        var tabs = document.querySelectorAll('.cart-prn-tab');
        if (generalPanel) generalPanel.style.display = isGeneral ? 'block' : 'none';
        if (haPanel) haPanel.style.display = isGeneral ? 'none' : 'block';
        tabs.forEach(function(t) {
            if ((isGeneral && t.textContent.includes('ทั่วไป')) || (!isGeneral && t.textContent.includes('High Alert'))) {
                t.style.color = isGeneral ? '#5B21B6' : '#DC2626';
                t.style.borderBottomColor = isGeneral ? '#7C3AED' : '#DC2626';
                t.style.borderBottomWidth = '2.5px';
            } else {
                t.style.color = 'var(--text-3)';
                t.style.borderBottomColor = 'transparent';
                t.style.borderBottomWidth = '0';
            }
        });
    }

    function cartGetPrnCatalog() {
        // Build unique PRN drug list from patientData
        var general = {}, highAlert = {};
        Object.keys(patientData).forEach(function(bed) {
            (patientData[bed].drugs || []).filter(function(d){ return d.prn; }).forEach(function(d) {
                var cat = d.highAlert ? highAlert : general;
                if (!cat[d.name]) {
                    var unit = /Morphine|amp|vial/i.test(d.name) ? 'amp' : /Insulin/i.test(d.name) ? 'dose' : 'เม็ด';
                    cat[d.name] = { name: d.name, unit: unit, highAlert: !!d.highAlert };
                }
            });
        });
        return { general: Object.values(general), highAlert: Object.values(highAlert) };
    }

    function cartPrnTotalStock(drugName) {
        // sum stock across all patients
        var total = 0;
        Object.keys(prnStockStore).forEach(function(k) {
            if (k.split('|')[1] === drugName) total += (prnStockStore[k].qty || 0);
        });
        return total;
    }

    function cartRenderPrnStock() {
        var catalog = cartGetPrnCatalog();
        // General
        var genList = document.getElementById('cartPrnGeneralList');
        if (genList) {
            genList.innerHTML = catalog.general.map(function(drug) {
                var total = cartPrnTotalStock(drug.name);
                var low = total <= 4;
                var empty = total <= 0;
                var qtyClass = empty ? 'empty' : (low ? 'low' : '');
                var rowClass = empty ? 'low' : (low ? 'low' : '');
                return '<div class="cart-prn-row ' + rowClass + '">'
                    + '<div style="flex:1;min-width:0;">'
                    + '<div class="cart-prn-name">' + escHtml(drug.name) + '</div>'
                    + '<div class="cart-prn-sub">สต็อกรวมใน Cart · PRN ทั่วไป</div>'
                    + '</div>'
                    + '<div class="cart-prn-qty ' + qtyClass + '">' + total + ' <span style="font-size:11px;font-weight:400;color:var(--text-3);">' + drug.unit + '</span></div>'
                    + '<button class="cart-prn-restock-btn" type="button" onclick="cartRestockDrug(\'' + escHtml(drug.name) + '\', false)" style="align-self:center;">เติม</button>'
                    + '</div>';
            }).join('') || '<div style="text-align:center;color:var(--text-3);font-size:12px;padding:12px;">ไม่มีข้อมูล</div>';
        }
        // High Alert
        var haList = document.getElementById('cartPrnHaList');
        var unlockBtn = document.getElementById('cartHaUnlockBtn');
        var lockBadge = document.getElementById('cartHaLockBadge');
        if (haList) {
            if (!cartHaUnlocked) {
                haList.innerHTML = '<div style="text-align:center;padding:16px;color:#B91C1C;font-size:12px;font-weight:600;">'
                    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" style="display:block;margin:0 auto 8px;"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>'
                    + 'ลิ้นชักล็อกอยู่<br><span style="color:var(--text-3);font-weight:400;">ใส่ PIN เพื่อดูสต็อกและเบิกยา</span></div>';
                if (unlockBtn) unlockBtn.style.display = 'flex';
                if (lockBadge) lockBadge.style.display = 'flex';
            } else {
                if (lockBadge) lockBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 010 8" style="display:none"/><path d="M8 11V7a4 4 0 018 0v4" style="opacity:0"/></svg>ปลดล็อกแล้ว';
                if (lockBadge) lockBadge.style.cssText = 'background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:700;color:#15803D;display:flex;align-items:center;gap:5px;';
                if (lockBadge) lockBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="11" width="14" height="10" rx="2"/></svg>ปลดล็อกแล้ว';
                if (unlockBtn) unlockBtn.style.display = 'none';
                haList.innerHTML = catalog.highAlert.map(function(drug) {
                    var total = cartPrnTotalStock(drug.name);
                    var low = total <= 2;
                    var empty = total <= 0;
                    var qtyClass = empty ? 'empty' : (low ? 'low' : '');
                    return '<div class="cart-prn-row ha ' + (low ? 'low' : '') + '">'
                        + '<div style="flex:1;min-width:0;">'
                        + '<div class="cart-prn-name">' + escHtml(drug.name)
                        + ' <span style="font-size:9px;background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;border-radius:4px;padding:1px 5px;font-weight:700;vertical-align:middle;">HA</span></div>'
                        + '<div class="cart-prn-sub">High Alert · ลิ้นชักล็อก</div>'
                        + '</div>'
                        + '<div class="cart-prn-qty ' + qtyClass + '">' + total + ' <span style="font-size:11px;font-weight:400;color:var(--text-3);">' + drug.unit + '</span></div>'
                        + '<button class="cart-prn-restock-btn" type="button" onclick="cartRestockDrug(\'' + escHtml(drug.name) + '\', true)" style="align-self:center;background:linear-gradient(135deg,#FEE2E2,#FEF9F9);border-color:#FCA5A5;color:#B91C1C;">เติม</button>'
                        + '</div>';
                }).join('') || '<div style="text-align:center;color:var(--text-3);font-size:12px;padding:12px;">ไม่มีข้อมูล</div>';
            }
        }
        // Update banner
        var banner = document.getElementById('cartPrnBanner');
        if (banner) {
            var totalDrugs = (catalog.general || []).length + (catalog.highAlert || []).length;
            var totalQty = 0;
            Object.keys(prnStockStore).forEach(function(k) { totalQty += (prnStockStore[k].qty || 0); });
            banner.textContent = totalDrugs > 0
                ? 'มียา PRN ในสต็อก ' + totalDrugs + ' ชนิด · รวม ' + totalQty + ' หน่วย'
                : 'ยังไม่มียา PRN ในสต็อก';
        }
    }

    function cartOpenPinModal() {
        cartPinValue = '';
        cartUpdatePinDots();
        document.getElementById('cartPinError').style.display = 'none';
        var overlay = document.getElementById('cartPinOverlay');
        overlay.style.display = 'flex';
    }

    function cartClosePinModal() {
        document.getElementById('cartPinOverlay').style.display = 'none';
        cartPinValue = '';
    }

    function cartPinKey(k) {
        if (cartPinValue.length >= 4) return;
        cartPinValue += k;
        cartUpdatePinDots();
        if (cartPinValue.length === 4) {
            setTimeout(function() {
                if (cartPinValue === CART_HA_PIN) {
                    cartHaUnlocked = true;
                    cartClosePinModal();
                    cartRenderPrnStock();
                    showToast('ปลดล็อกสำเร็จ ✓');
                } else {
                    document.getElementById('cartPinError').style.display = 'block';
                    cartPinValue = '';
                    cartUpdatePinDots();
                }
            }, 200);
        }
    }

    function cartPinBackspace() {
        cartPinValue = cartPinValue.slice(0, -1);
        cartUpdatePinDots();
        document.getElementById('cartPinError').style.display = 'none';
    }

    function cartUpdatePinDots() {
        for (var i = 0; i < 4; i++) {
            var dot = document.getElementById('pinDot' + i);
            if (dot) {
                dot.style.background = i < cartPinValue.length ? '#DC2626' : 'white';
                dot.style.borderColor = i < cartPinValue.length ? '#DC2626' : '#CBD5E1';
            }
        }
    }

    var cartRestockTarget = null;

    function cartRestockDrug(drugName, isHA) {
        if (isHA && !cartHaUnlocked) { cartOpenPinModal(); return; }
        cartRestockTarget = { drugName: drugName, isHA: isHA };
        var currentQty = cartPrnTotalStock(drugName);
        var maxQty = /Morphine/i.test(drugName) ? 5 : /Lorazepam/i.test(drugName) ? 8 : 20;
        var unit = /Morphine|amp|vial/i.test(drugName) ? 'amp' : /Insulin/i.test(drugName) ? 'dose' : 'เม็ด';

        document.getElementById('cartRestockDrugLabel').textContent = drugName;
        document.getElementById('cartRestockCurrentQty').textContent = currentQty + ' ' + unit;

        // icon color for HA vs normal
        var icon = document.getElementById('cartRestockIcon');
        if (icon) icon.style.background = isHA ? 'linear-gradient(135deg,#FEF2F2,#FEE2E2)' : 'linear-gradient(135deg,#EDE9FE,#DDD6FE)';
        var btn = document.getElementById('cartRestockConfirmBtn');
        if (btn) btn.style.background = isHA ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#7C3AED,#8B5CF6)';

        // Quick chips
        var chips = document.getElementById('cartRestockChips');
        var quickVals = maxQty <= 8 ? [1, 2, 3, 5] : [5, 10, 15, 20];
        chips.innerHTML = quickVals.map(function(v) {
            return '<button type="button" onclick="document.getElementById(\'cartRestockQtyInput\').value=' + v + '" '
                + 'style="padding:5px 14px;border-radius:8px;border:1.5px solid #E2E8F0;background:white;font-size:12px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;color:var(--text-2);">+' + v + '</button>';
        }).join('');

        document.getElementById('cartRestockQtyInput').value = quickVals[1] || 5;
        document.getElementById('cartRestockQtyInput').max = maxQty;
        document.getElementById('cartRestockOverlay').style.display = 'flex';
    }

    function cartCloseRestockModal() {
        document.getElementById('cartRestockOverlay').style.display = 'none';
        cartRestockTarget = null;
    }

    function cartRestockAdjust(delta) {
        var input = document.getElementById('cartRestockQtyInput');
        var val = parseInt(input.value || '0') + delta;
        input.value = Math.max(1, val);
    }

    function cartConfirmRestock() {
        if (!cartRestockTarget) return;
        var qty = parseInt(document.getElementById('cartRestockQtyInput').value) || 0;
        if (qty <= 0) { showToast('กรุณาระบุจำนวน'); return; }
        var drugName = cartRestockTarget.drugName;
        var maxQty = /Morphine/i.test(drugName) ? 5 : /Lorazepam/i.test(drugName) ? 8 : 20;
        var foundExisting = false;
        Object.keys(prnStockStore).forEach(function(k) {
            if (k.split('|')[1] === drugName) {
                prnStockStore[k].qty = Math.min((prnStockStore[k].qty || 0) + qty, maxQty);
                foundExisting = true;
            }
        });
        // If no existing entry, create a new master stock entry
        if (!foundExisting) {
            var masterKey = 'stock|' + drugName + '|master';
            prnStockStore[masterKey] = { drugName: drugName, qty: Math.min(qty, maxQty), isHA: cartRestockTarget.isHA };
        }
        prnStockSave();
        cartCloseRestockModal();
        cartRenderPrnStock();
        showToast('เติม ' + qty + ' หน่วย · ' + drugName + ' ✓');
    }

    // Lock HA drawer after nav away
    document.addEventListener('pageChanged', function() { cartHaUnlocked = false; });


    function prnGetStock(bed, drugName) {
        var key = bed + '|' + drugName;
        return prnStockStore[key] || { qty: 0, lastGiven: null };
    }

    function prnCanGive(bed, drugName) {
        var stock = prnGetStock(bed, drugName);
        if (stock.qty <= 0) return { ok: false, reason: 'สต็อกยาหมด' };
        var drug = (patientData[bed] && patientData[bed].drugs || []).find(function(d){ return d.name === drugName && d.prn; });
        if (drug && drug.interval && stock.lastGiven) {
            var msSince = Date.now() - stock.lastGiven;
            var msInterval = drug.interval * 3600 * 1000;
            if (msSince < msInterval) {
                var hoursLeft = ((msInterval - msSince) / 3600000).toFixed(1);
                return { ok: false, reason: 'ยังไม่ครบ interval — ให้ได้อีกใน ' + hoursLeft + ' ชม.' };
            }
        }
        return { ok: true };
    }

    var rtPrnTarget = null; // { bed, drugIdx } — drug in patientData[bed].drugs

    function rtOpenPrnModal(bed, prnDrugIdx) {
        var ptData = patientData[bed];
        if (!ptData) return;
        var prnDrugs = (ptData.drugs || []).filter(function(d){ return d.prn; });
        var drug = prnDrugs[prnDrugIdx];
        if (!drug) return;
        rtPrnTarget = { bed: bed, drugName: drug.name };

        document.getElementById('rtPrnDrugName').textContent = drug.name;
        var stock = prnGetStock(bed, drug.name);
        var stockEl = document.getElementById('rtPrnStockVal');
        var unit = /Morphine|Insulin|Ceftriaxone|Heparin|amp|vial/i.test(drug.name) ? 'หน่วย' : 'เม็ด';
        stockEl.textContent = stock.qty + ' ' + unit;
        stockEl.style.color = stock.qty <= 2 ? '#B91C1C' : (stock.qty <= 4 ? '#92400E' : '#5B21B6');

        document.getElementById('rtPrnInfo').innerHTML =
            '<strong>' + escHtml(ptData.name) + '</strong> · เตียง ' + escHtml(ptData.bed) +
            ' · HN ' + escHtml(ptData.hn) + '<br>' +
            '<span style="color:#6D28D9;">ข้อบ่งชี้: ' + escHtml(drug.indication || '') + '</span>' +
            (drug.interval ? ' · ทุก ' + drug.interval + ' ชม.' : '');

        var warnEl = document.getElementById('rtPrnIntervalWarn');
        var canGive = prnCanGive(bed, drug.name);
        if (!canGive.ok) {
            warnEl.style.display = 'block';
            warnEl.textContent = '⚠ ' + canGive.reason;
        } else {
            warnEl.style.display = 'none';
        }

        var indicInput = document.getElementById('rtPrnIndicationInput');
        indicInput.value = drug.indication || '';

        var confirmBtn = document.getElementById('rtPrnConfirmBtn');
        confirmBtn.disabled = stock.qty <= 0;
        confirmBtn.style.opacity = stock.qty <= 0 ? '0.45' : '1';

        document.getElementById('rtPrnOverlay').style.display = 'flex';
    }

    function rtClosePrnModal() {
        document.getElementById('rtPrnOverlay').style.display = 'none';
        rtPrnTarget = null;
    }

    function rtConfirmPrn() {
        if (!rtPrnTarget) return;
        var indication = document.getElementById('rtPrnIndicationInput').value.trim();
        if (!indication) { showToast('กรุณาระบุข้อบ่งชี้'); return; }
        var bed = rtPrnTarget.bed;
        var drugName = rtPrnTarget.drugName;
        var stock = prnGetStock(bed, drugName);
        if (stock.qty <= 0) { showToast('สต็อกยาหมด'); return; }
        // decrement stock
        stock.qty -= 1;
        stock.lastGiven = Date.now();
        prnStockSave();
        // record in eMAR
        var ptData = patientData[bed];
        recordEmarAdministration({
            patientKey: bed,
            patientName: ptData ? ptData.name : bed,
            bed: ptData ? ptData.bed : bed,
            drugName: drugName,
            type: 'prn',
            indication: indication,
            status: 'ให้ยาแล้ว'
        });
        rtClosePrnModal();
        // refresh PRN section
        rtRenderPrnSection(bed);
        showToast('บันทึกการให้ยา PRN เรียบร้อย ✓');
    }

    function rtRenderPrnSection(bed) {
        var container = document.getElementById('rtStep2PrnSection');
        if (!container) return;
        var ptData = patientData[bed];
        if (!ptData) { container.style.display = 'none'; return; }
        container.style.display = 'block';
        container.style.marginTop = '14px';
        var inventory = (typeof getPrnStockInventory === 'function') ? getPrnStockInventory() : [];
        var totalDrugs = inventory.length;
        var totalQty = inventory.reduce(function(s, d) { return s + d.qty; }, 0);
        var hasStock = totalDrugs > 0;
        var subText = hasStock
            ? 'มียา PRN ในสต็อก ' + totalDrugs + ' ชนิด · รวม ' + totalQty + ' หน่วย'
            : 'ยังไม่มียา PRN ในสต็อก — กรุณาเติมก่อน';
        var btnDisabled = hasStock ? '' : 'disabled ';
        var btnStyle = hasStock
            ? 'background:linear-gradient(135deg,#BE185D,#DB2777);color:white;box-shadow:0 3px 10px rgba(190,24,93,0.25);'
            : 'background:#F1F5F9;color:#94A3B8;cursor:not-allowed;';
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:linear-gradient(135deg,#FDF2F8,#FCE7F3);border:1.5px solid #FBCFE8;border-radius:14px;">'
            + '<div style="display:flex;align-items:center;gap:10px;">'
                + '<div style="width:32px;height:32px;border-radius:10px;background:white;border:1px solid #FBCFE8;display:flex;align-items:center;justify-content:center;color:#BE185D;">'
                + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
                + '</div>'
                + '<div><div style="font-size:13px;font-weight:800;color:#9F1239;">ขอยา PRN จากสต็อกสำรอง</div>'
                + '<div style="font-size:11px;color:#BE185D;font-weight:600;margin-top:2px;">' + escHtml(subText) + '</div></div>'
            + '</div>'
            + '<button ' + btnDisabled + 'onclick="rtOpenPrnRequestModal(\'' + escHtml(bed) + '\')" style="padding:9px 16px;border-radius:10px;border:none;font-size:12px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;' + btnStyle + '">'
                + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
                + 'ขอยา</button>'
            + '</div>';
    }

    function rtOpenPrnRequestModal(bed) {
        var ptData = patientData[bed];
        var inventory = (typeof getPrnStockInventory === 'function') ? getPrnStockInventory() : [];
        var modal = document.getElementById('rtPrnRequestModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'rtPrnRequestModal';
            document.body.appendChild(modal);
        }
        modal.style.cssText = 'position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.5);backdrop-filter:blur(8px);padding:18px;';
        modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
        var listHtml = inventory.length ? inventory.map(function(drug, i) {
            var haTag = drug.ha ? '<span style="background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;font-size:9px;font-weight:800;padding:1px 6px;border-radius:6px;margin-left:4px;">HA</span>' : '';
            var casetteSummary = drug.cassettes.map(function(c) { return 'D' + c.drawer + '·C' + c.cassette; }).join(', ');
            var stockLow = drug.qty <= 3;
            var qtyBadgeStyle = stockLow ? 'color:#B45309;background:#FEF3C7;border-color:#FDE68A;' : 'color:#BE185D;background:#FCE7F3;border-color:#FBCFE8;';
            return '<button type="button" onclick="rtRequestPrnDrug(\'' + escHtml(bed) + '\',\'' + escHtml(drug.name) + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:white;border:1.5px solid #E2E8F0;border-radius:14px;cursor:pointer;text-align:left;font-family:\'Prompt\',sans-serif;width:100%;transition:all .15s;" onmouseover="this.style.borderColor=\'#FBCFE8\';this.style.background=\'#FDF2F8\'" onmouseout="this.style.borderColor=\'#E2E8F0\';this.style.background=\'white\'">'
                + '<div style="width:32px;height:32px;border-radius:10px;background:#FCE7F3;color:#BE185D;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
                + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>'
                + '<div style="flex:1;min-width:0;">'
                + '<div style="font-size:13px;font-weight:800;color:#0f172a;">' + escHtml(drug.name) + haTag + '</div>'
                + '<div style="font-size:11px;color:#64748b;font-weight:600;margin-top:2px;">' + escHtml(drug.form || '-') + (casetteSummary ? ' · ' + escHtml(casetteSummary) : '') + '</div>'
                + '</div>'
                + '<span style="font-size:12px;font-weight:800;border:1px solid;padding:5px 11px;border-radius:10px;white-space:nowrap;' + qtyBadgeStyle + '">' + drug.qty + ' ' + escHtml(drug.unit) + '</span>'
                + '</button>';
        }).join('') : '<div style="padding:28px 22px;text-align:center;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:14px;"><div style="font-size:13px;color:#64748B;font-weight:700;">ยังไม่มียา PRN ในสต็อก</div><div style="font-size:11px;color:#94A3B8;font-weight:600;margin-top:4px;">กรุณาเติมยา PRN เข้า Cassette ก่อน</div></div>';
        modal.innerHTML = '<div style="width:100%;max-width:560px;max-height:82vh;background:white;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,0.3);overflow:hidden;display:flex;flex-direction:column;">'
            + '<div style="padding:18px 22px;background:linear-gradient(135deg,#FDF2F8,#FCE7F3);border-bottom:1px solid #FBCFE8;display:flex;align-items:center;gap:12px;">'
                + '<div style="width:40px;height:40px;border-radius:12px;background:white;border:1.5px solid #FBCFE8;display:flex;align-items:center;justify-content:center;color:#BE185D;">'
                + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>'
                + '<div style="flex:1;"><div style="font-size:15px;font-weight:900;color:#0f172a;">ขอยา PRN</div><div style="font-size:12px;color:#9F1239;font-weight:600;margin-top:2px;">' + escHtml(ptData ? ptData.name + ' · ' + ptData.bed : bed) + '</div></div>'
                + '<button onclick="document.getElementById(\'rtPrnRequestModal\').style.display=\'none\'" style="width:30px;height:30px;border:none;border-radius:50%;background:rgba(255,255,255,0.8);cursor:pointer;color:#334155;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
            + '</div>'
            + '<div style="padding:16px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">' + listHtml + '</div>'
            + '</div>';
    }

    function rtRequestPrnDrug(bed, drugName) {
        var inventory = (typeof getPrnStockInventory === 'function') ? getPrnStockInventory() : [];
        var nKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(drugName) : drugName;
        var drug = inventory.find(function(d) {
            var dKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(d.name) : d.name;
            return dKey === nKey;
        });
        if (!drug || drug.qty <= 0) {
            showToast('ยา ' + drugName + ' ไม่มีในสต็อกแล้ว');
            setTimeout(function() { showToast(''); }, 2200);
            return;
        }
        var ptData = patientData[bed];
        var modal = document.getElementById('rtPrnRequestModal');
        if (modal) modal.style.display = 'none';
        var maxQty = drug.qty;

        var form = document.getElementById('rtPrnRequestFormModal');
        if (!form) {
            form = document.createElement('div');
            form.id = 'rtPrnRequestFormModal';
            document.body.appendChild(form);
        }
        form.style.cssText = 'position:fixed;inset:0;z-index:10025;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.55);backdrop-filter:blur(8px);padding:18px;';
        form.onclick = function(e) { if (e.target === form) form.style.display = 'none'; };
        var haTag = drug.ha ? '<span style="background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;font-size:9px;font-weight:800;padding:1px 6px;border-radius:6px;margin-left:4px;">HA</span>' : '';
        var reasons = ['ปวด (VAS ≥ 4)','ไข้ (T ≥ 38°C)','คลื่นไส้/อาเจียน','นอนไม่หลับ','วิตกกังวล','หอบเหนื่อย','อื่นๆ'];
        var reasonBtns = reasons.map(function(r, i) {
            return '<button type="button" class="prn-reason-btn" data-reason="' + escHtml(r) + '" onclick="rtPrnReasonPick(this)" style="padding:8px 12px;border-radius:10px;border:1.5px solid #E2E8F0;background:white;color:#475569;font-size:12px;font-weight:600;font-family:\'Prompt\',sans-serif;cursor:pointer;transition:all .15s;">' + escHtml(r) + '</button>';
        }).join('');
        form.innerHTML = '<div style="width:100%;max-width:520px;background:white;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,0.32);overflow:hidden;display:flex;flex-direction:column;max-height:88vh;">'
            + '<div style="padding:18px 22px;background:linear-gradient(135deg,#FDF2F8,#FCE7F3);border-bottom:1px solid #FBCFE8;display:flex;align-items:center;gap:12px;">'
                + '<div style="width:40px;height:40px;border-radius:12px;background:white;border:1.5px solid #FBCFE8;display:flex;align-items:center;justify-content:center;color:#BE185D;">'
                + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>'
                + '<div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:900;color:#0f172a;">ขอยา PRN</div><div style="font-size:12px;color:#9F1239;font-weight:600;margin-top:2px;">' + escHtml(drug.name) + haTag + '</div></div>'
                + '<button type="button" onclick="document.getElementById(\'rtPrnRequestFormModal\').style.display=\'none\'" style="width:30px;height:30px;border:none;border-radius:50%;background:rgba(255,255,255,0.8);cursor:pointer;color:#334155;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
            + '</div>'
            + '<div style="padding:18px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;">'
                + '<div style="padding:10px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;font-size:12px;color:#475569;font-weight:600;display:flex;justify-content:space-between;gap:10px;">'
                    + '<span>ผู้ป่วย</span>'
                    + '<span style="color:#0f172a;font-weight:800;">' + escHtml(ptData ? ptData.name + ' · ' + ptData.bed : bed) + '</span>'
                + '</div>'
                + '<div>'
                    + '<div style="font-size:12px;font-weight:800;color:#334155;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;"><span>จำนวนที่ขอ <span style="color:#DC2626;">*</span></span><span style="font-size:11px;color:#64748B;font-weight:700;">คงเหลือในสต็อก: <strong style="color:#BE185D;">' + maxQty + ' ' + escHtml(drug.unit) + '</strong></span></div>'
                    + '<div style="display:flex;align-items:center;gap:10px;">'
                        + '<button type="button" onclick="rtPrnQtyAdj(-1)" style="width:40px;height:40px;border-radius:12px;border:1.5px solid #FBCFE8;background:white;color:#BE185D;font-size:22px;font-weight:700;cursor:pointer;">−</button>'
                        + '<input id="rtPrnReqQty" type="number" min="1" max="' + maxQty + '" value="1" data-max="' + maxQty + '" style="width:90px;text-align:center;font-size:24px;font-weight:900;color:#0f172a;border:1.5px solid #FBCFE8;border-radius:12px;padding:6px;font-family:\'Prompt\',sans-serif;">'
                        + '<button type="button" onclick="rtPrnQtyAdj(1)" style="width:40px;height:40px;border-radius:12px;border:1.5px solid #FBCFE8;background:white;color:#BE185D;font-size:22px;font-weight:700;cursor:pointer;">+</button>'
                        + '<span style="font-size:13px;color:#64748b;font-weight:700;">' + escHtml(drug.unit) + '</span>'
                    + '</div>'
                + '</div>'
                + '<div>'
                    + '<div style="font-size:12px;font-weight:800;color:#334155;margin-bottom:8px;">สาเหตุที่ขอ <span style="color:#DC2626;">*</span></div>'
                    + '<div id="rtPrnReasonChips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">' + reasonBtns + '</div>'
                    + '<textarea id="rtPrnReqReason" rows="3" placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" style="width:100%;padding:10px 12px;border:1.5px solid #E2E8F0;border-radius:12px;font-size:13px;color:#0f172a;font-family:\'Prompt\',sans-serif;resize:vertical;"></textarea>'
                + '</div>'
            + '</div>'
            + '<div style="padding:14px 22px;border-top:1px solid #F1F5F9;background:#FAFAFA;display:flex;gap:10px;">'
                + '<button type="button" onclick="document.getElementById(\'rtPrnRequestFormModal\').style.display=\'none\'" style="flex:1;padding:11px;border-radius:12px;border:1.5px solid #CBD5E1;background:white;color:#334155;font-size:13px;font-weight:700;font-family:\'Prompt\',sans-serif;cursor:pointer;">ยกเลิก</button>'
                + '<button type="button" onclick="rtSubmitPrnRequest(\'' + escHtml(bed) + '\',\'' + escHtml(drug.name) + '\')" style="flex:2;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#BE185D,#DB2777);color:white;font-size:13px;font-weight:800;font-family:\'Prompt\',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(190,24,93,0.28);">ยืนยันขอยา</button>'
            + '</div>'
            + '</div>';
    }

    function rtPrnQtyAdj(delta) {
        var inp = document.getElementById('rtPrnReqQty');
        if (!inp) return;
        var max = parseInt(inp.getAttribute('data-max') || inp.max || '999', 10) || 999;
        var v = (parseInt(inp.value) || 1) + delta;
        if (v < 1) v = 1;
        if (v > max) v = max;
        inp.value = v;
    }

    function rtPrnReasonPick(btn) {
        var chips = document.querySelectorAll('#rtPrnReasonChips .prn-reason-btn');
        chips.forEach(function(c) {
            c.style.background = 'white';
            c.style.borderColor = '#E2E8F0';
            c.style.color = '#475569';
            c.classList.remove('selected');
        });
        btn.style.background = '#FCE7F3';
        btn.style.borderColor = '#FBCFE8';
        btn.style.color = '#BE185D';
        btn.classList.add('selected');
    }

    function rtSubmitPrnRequest(bed, drugName) {
        var inventory = (typeof getPrnStockInventory === 'function') ? getPrnStockInventory() : [];
        var nKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(drugName) : drugName;
        var drug = inventory.find(function(d) {
            var dKey = (typeof normalizeIbfDrugName === 'function') ? normalizeIbfDrugName(d.name) : d.name;
            return dKey === nKey;
        });
        if (!drug || drug.qty <= 0) {
            showToast('ยา ' + drugName + ' ไม่มีในสต็อกแล้ว');
            setTimeout(function() { showToast(''); }, 2200);
            return;
        }
        var rawQty = parseInt(document.getElementById('rtPrnReqQty').value) || 1;
        var qty = Math.min(Math.max(1, rawQty), drug.qty);
        var selected = document.querySelector('#rtPrnReasonChips .prn-reason-btn.selected');
        var reasonTag = selected ? selected.getAttribute('data-reason') : '';
        var reasonNote = (document.getElementById('rtPrnReqReason').value || '').trim();
        if (!reasonTag && !reasonNote) {
            showToast('กรุณาเลือกหรือระบุสาเหตุที่ขอยา');
            setTimeout(function() { showToast(''); }, 2200);
            return;
        }
        var form = document.getElementById('rtPrnRequestFormModal');
        if (form) form.style.display = 'none';
        var reasonText = [reasonTag, reasonNote].filter(Boolean).join(' · ');

        // Push into patientData so scan step (rtBuildDrugCards → getLegacyDrugs) picks it up.
        // Avoid "prn" text in desc so isPrnLegacyDrug doesn't filter it out; mark with requestedPrn flag.
        var pt = patientData[bed];
        if (pt) {
            if (!Array.isArray(pt.drugs)) pt.drugs = [];
            var routeGuess = /Injection|Inhaler|vial|amp/i.test(drug.form) ? 'IV' : 'PO';
            pt.drugs.push({
                name: drug.name,
                dose: qty + ' ' + drug.unit,
                desc: qty + ' ' + drug.unit + ' · ' + routeGuess + ' · สาเหตุ: ' + reasonText,
                route: routeGuess,
                freq: 'ครั้งเดียว',
                schedule: 'ครั้งเดียว',
                time: new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }),
                highAlert: !!drug.ha,
                requestedPrn: true,
                prnReason: reasonText,
                prnQty: qty,
                prnUnit: drug.unit
            });
        }

        // Append new row into รายการยาปกติ with (PRN) suffix
        var list = document.getElementById('rtStep2DrugList');
        if (list) {
            var div = document.createElement('div');
            div.className = 'rt-drug';
            var haTag = drug.ha ? ' <span style="font-size:9px;background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;border-radius:4px;padding:1px 5px;font-weight:700;margin-left:3px;">HA</span>' : '';
            div.innerHTML = '<div class="rt-drug-bar" style="background:#DB2777;"></div>'
                + '<div class="rt-drug-info">'
                    + '<div class="rt-drug-name">' + escHtml(drug.name) + ' <span style="font-size:10px;font-weight:800;color:#BE185D;background:#FCE7F3;border:1px solid #FBCFE8;padding:1px 6px;border-radius:5px;margin-left:4px;">PRN</span>' + haTag + '</div>'
                    + '<div class="rt-drug-sub">' + escHtml(drug.form) + ' · ' + qty + ' ' + escHtml(drug.unit) + ' · ' + escHtml(reasonText) + '</div>'
                + '</div>'
                + '<div class="rt-drug-right"><span class="am-drug-st wait" style="font-size:11px;background:#FCE7F3;color:#BE185D;">รอให้ยา</span></div>';
            list.appendChild(div);
        }

        // Update title count
        var titleEl = document.getElementById('rtStep2DrugTitle');
        if (titleEl) {
            var m = titleEl.textContent.match(/\((\d+) รายการ\)/);
            if (m) {
                var n = parseInt(m[1], 10) + 1;
                titleEl.textContent = titleEl.textContent.replace(/\(\d+ รายการ\)/, '(' + n + ' รายการ)');
            }
        }

        // Decrement PRN stock from cassettes
        if (typeof decrementPrnStock === 'function') decrementPrnStock(drug.name, qty);

        // Re-render request section (stock counts) and scan cards
        if (typeof rtRenderPrnSection === 'function') { try { rtRenderPrnSection(bed); } catch(e) {} }
        if (typeof rtBuildDrugCards === 'function' && document.getElementById('rtDrugCardsContainer')) {
            try { rtBuildDrugCards(); } catch(e) {}
        }

        showToast('เพิ่ม ' + drug.name + ' (PRN) ' + qty + ' ' + drug.unit + ' ในรายการยาแล้ว ✓');
        setTimeout(function() { showToast(''); }, 2800);
    }

    function rtBuildDrugCards() {
        var drugs = getLegacyDrugs();
        rtDrugs = drugs.map(function(d) {
            var routeMap = {PO:'PO (รับประทาน)',IV:'IV (หลอดเลือดดำ)',SC:'SC (ใต้ผิวหนัง)',IM:'IM (เข้ากล้ามเนื้อ)'};
            return {
                name: d.name||'',
                dose: (d.dose||d.name||''),
                route: routeMap[d.route]||d.route||'PO',
                time: d.time||'',
                freq: d.freq||d.schedule||'',
                requestedPrn: !!d.requestedPrn,
                prnReason: d.prnReason || ''
            };
        });
        var container = document.getElementById('rtDrugCardsContainer');
        if (!container) return;
        container.innerHTML = rtDrugs.map(function(d, i) {
            var state = rtDrugStates[i];
            // Hold/Omit card — pre-done, no scan needed
            if (state) {
                var isHold = state.type === 'hold';
                var stateLabel = isHold ? 'Hold' : 'Omit';
                var stateColor = isHold ? '#EA580C' : '#D97706';
                var stateBg = isHold ? '#FFF7ED' : '#FFFBEB';
                var stateBorder = isHold ? '#FED7AA' : '#FDE68A';
                return '<div class="mdc '+(isHold?'hold-card':'omit-card')+'" id="rdrug_'+i+'" data-flow="r" data-done="true" style="margin-bottom:12px;border:1.5px solid '+stateBorder+';background:'+stateBg+';">'
                    +'<div class="mdc-bar" style="background:'+stateColor+';"></div>'
                    +'<div class="mdc-body"><div class="mdc-header"><div class="mdc-info">'
                    +'<div class="mdc-name" style="font-size:15px;">'+d.name+'</div>'
                    +'<div class="mdc-sub" style="color:'+stateColor+';">'+stateLabel+' · '+escHtml(state.reason)+'</div>'
                    +'</div>'
                    +'<span style="font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;background:'+stateBg+';color:'+stateColor+';border:1.5px solid '+stateBorder+';">'+stateLabel+'</span>'
                    +'</div></div></div>';
            }
            var isLast = i === rtDrugs.length - 1;
            var scanBtns = '<button class="mdc-btn" id="rdrug_'+i+'_btn" style="background:linear-gradient(135deg,#0d9488,#14b8a6);border-radius:12px;padding:10px 18px;font-weight:700;" onclick="scanMultiDrug(\'r\','+i+')">'
                +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="vertical-align:middle;margin-right:4px;"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>สแกน</button>';
            if (isLast) {
                scanBtns = '<div style="display:flex;gap:6px;">' + scanBtns
                    + '<button class="mdc-btn" style="background:linear-gradient(135deg,#DC2626,#EF4444);border-radius:12px;padding:10px 12px;font-weight:700;font-size:10px;" onclick="scanMultiDrug(\'r\','+i+',true)">'
                    + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="vertical-align:middle;margin-right:3px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Demo: ยาผิด</button></div>';
            }
            var prnChip = d.requestedPrn ? ' <span style="font-size:10px;font-weight:800;color:#BE185D;background:#FCE7F3;border:1px solid #FBCFE8;padding:1px 6px;border-radius:5px;margin-left:4px;vertical-align:middle;">PRN</span>' : '';
            var barBg = d.requestedPrn ? 'linear-gradient(180deg,#BE185D,#DB2777)' : 'linear-gradient(180deg,#059669,#0D9488)';
            var reasonLine = d.requestedPrn && d.prnReason ? '<div class="mdc-sub" style="color:#BE185D;font-size:10px;margin-top:2px;">สาเหตุ: ' + escHtml(d.prnReason) + '</div>' : '';
            return '<div class="mdc" id="rdrug_'+i+'" data-flow="r" data-done="false" style="margin-bottom:12px;">'
                +'<div class="mdc-bar" style="background:'+barBg+';"></div>'
                +'<div class="mdc-body"><div class="mdc-header"><div class="mdc-info">'
                +'<div class="mdc-name" style="font-size:15px;">'+d.name+prnChip+'</div>'
                +'<div class="mdc-sub">'+(d.route.split(' ')[0]||'PO')+' · '+d.dose+' · '+d.freq+'</div>'
                +reasonLine
                +'</div>'+scanBtns+'</div>'
                +'<div class="mdc-done-row" id="rdrug_'+i+'_done" style="display:none;">'
                +'<div class="mdc-rights">'
                +'<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Patient</div>'
                +'<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Drug</div>'
                +'<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Dose</div>'
                +'<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Route</div>'
                +'<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Time</div>'
                +'</div>'
                +'<span class="mdc-result-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="#166534"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span id="rdrug_'+i+'_resname">—</span></span>'
                +'<span style="font-size:11px;color:var(--text-2);" id="rdrug_'+i+'_lot">—</span>'
                +'</div></div></div>';
        }).join('');
        var btn = document.getElementById('rtBtnConfirmDrug');
        var pendingCount = rtDrugs.filter(function(_, i) { return !rtDrugStates[i]; }).length;
        var heldOmit = rtDrugs.length - pendingCount;
        var labelSuffix = heldOmit ? ' · Hold/Omit ' + heldOmit : '';
        if (btn) {
            if (pendingCount === 0 && heldOmit > 0) {
                btn.disabled = false;
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ยืนยัน ('+heldOmit+' Hold/Omit)';
            } else {
                btn.disabled = true;
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ยืนยันให้ยา (0/'+pendingCount+')'+labelSuffix;
            }
        }
    }

    function rtOpenHoldOmit(idx, type) {
        var pt = dispensePatients[currentDispenseBed];
        var drug = pt ? pt.drugs[idx] : null;
        var drugName = drug ? drug.name : (rtDrugs[idx] ? rtDrugs[idx].name : 'ยา');
        rtHoldOmitTarget = { type: type, idx: idx };
        var isHold = type === 'hold';
        var reasons = isHold ? rtHoldReasons : rtOmitReasons;
        var color = isHold ? '#EA580C' : '#D97706';
        var iconBg = isHold ? 'linear-gradient(135deg,#EA580C,#F97316)' : 'linear-gradient(135deg,#D97706,#F59E0B)';
        var icon = isHold
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
        document.getElementById('rthoIcon').style.background = iconBg;
        document.getElementById('rthoIcon').innerHTML = icon;
        document.getElementById('rthoTitle').textContent = isHold ? 'Hold ยา — พักชั่วคราว' : 'Omit ยา — ข้ามรอบนี้';
        document.getElementById('rthoDrugName').textContent = drugName;
        document.getElementById('rthoReasonInput').value = '';
        var chipsEl = document.getElementById('rthoReasonChips');
        chipsEl.innerHTML = reasons.map(function(r) {
            return '<button class="rtho-chip" onclick="rthoSelectChip(this)">' + r + '</button>';
        }).join('');
        var confirmBtn = document.getElementById('rthoConfirmBtn');
        confirmBtn.textContent = isHold ? 'Hold ยานี้' : 'Omit ยานี้';
        confirmBtn.style.background = iconBg;
        document.getElementById('rtHoldOmitOverlay').style.display = 'flex';
    }

    function rthoSelectChip(el) {
        document.querySelectorAll('#rthoReasonChips .rtho-chip').forEach(function(c) { c.classList.remove('active'); });
        el.classList.add('active');
        document.getElementById('rthoReasonInput').value = '';
    }

    function rtCloseHoldOmitModal() {
        document.getElementById('rtHoldOmitOverlay').style.display = 'none';
        rtHoldOmitTarget = null;
    }

    function rtConfirmHoldOmit() {
        var target = rtHoldOmitTarget;
        if (!target) return;
        var activeChip = document.querySelector('#rthoReasonChips .rtho-chip.active');
        var reason = activeChip ? activeChip.textContent : document.getElementById('rthoReasonInput').value.trim();
        if (!reason) { showToast('กรุณาระบุเหตุผล'); setTimeout(function(){ showToast(''); }, 1600); return; }
        rtDrugStates[target.idx] = { type: target.type, reason: reason };
        // Update step 2 drug row
        var drugRows = document.querySelectorAll('#rtStep2 .rt-drug');
        var row = drugRows[target.idx];
        if (row) {
            var isHold = target.type === 'hold';
            row.className = 'rt-drug ' + (isHold ? 'hold-drug' : 'omit-drug');
            var barEl = row.querySelector('.rt-drug-bar');
            if (barEl) barEl.className = 'rt-drug-bar ' + (isHold ? 'hold' : 'omit');
            var infoEl = row.querySelector('.rt-drug-info');
            if (infoEl) {
                var reasonLine = infoEl.querySelector('.rt-ho-reason');
                if (!reasonLine) {
                    reasonLine = document.createElement('div');
                    reasonLine.className = 'rt-ho-reason';
                    reasonLine.style.cssText = 'font-size:10px;color:#92400e;margin-top:2px;';
                    infoEl.appendChild(reasonLine);
                }
                reasonLine.textContent = reason;
            }
            var rightEl = row.querySelector('.rt-drug-right');
            if (rightEl) {
                rightEl.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:6px;';
                rightEl.innerHTML = '<span class="am-drug-st ' + target.type + '" style="font-size:11px;">' + (isHold ? 'Hold ยา' : 'Omit ยา') + '</span>'
                    + (isHold ? '<button class="rt-hold-omit-btn resume" onclick="rtResumedrug(' + target.idx + ')">↩ Resume</button>' : '');
            }
        }
        // Record in eMAR
        var pt = dispensePatients[currentDispenseBed] || {};
        var drug = (pt.drugs || [])[target.idx] || {};
        recordEmarAdministration({
            ward: emarWardName(), patientKey: currentDispenseBed,
            patientName: pt.name || '', hn: pt.hn || '', bed: pt.bed || '',
            drugName: drug.name || '', dose: drug.dose || '', route: drug.route || 'PO',
            schedule: pt.round || 'รอบเช้า', dueTime: drug.time || '',
            givenTime: emarCurrentTimeLabel(),
            holdOmit: target.type, holdOmitReason: reason,
            done: false, prn: false, source: target.type === 'hold' ? 'Hold' : 'Omit'
        });
        rtCloseHoldOmitModal();
        showToast((target.type === 'hold' ? 'Hold' : 'Omit') + ' ' + (drug.name || 'ยา') + ' — ' + reason);
        setTimeout(function(){ showToast(''); }, 2200);
    }
    let rtActiveDrugIdx = 0;

    function rtPickDrug(el) {
        // Don't allow picking done drugs
        if (el.classList.contains('done')) return;
        const drugs = document.querySelectorAll('#rtStep4 .rt-drug');
        drugs.forEach((d,i) => { d.classList.remove('active'); if (d === el) rtActiveDrugIdx = i; });
        el.classList.add('active');
        // Update drug info panel
        const d = rtDrugs[rtActiveDrugIdx];
        if (!d) return;
        const infoPanel = document.querySelector('#rtStep4 [style*="font-size:18px"]');
        if (infoPanel) infoPanel.innerHTML = d.name + haBadge(d.name);
        const grid = infoPanel ? infoPanel.nextElementSibling : null;
        if (grid) {
            grid.innerHTML = '<div><div class="am-dl">Dose</div><div class="am-dv green">' + d.dose + '</div></div>'
                + '<div><div class="am-dl">Route</div><div class="am-dv">' + d.route + '</div></div>'
                + '<div><div class="am-dl">เวลา</div><div class="am-dv">' + d.time + '</div></div>'
                + '<div><div class="am-dl">Frequency</div><div class="am-dv">' + d.freq + '</div></div>';
        }
        // Reset scan state when switching drug
        rtResetDrugScan();
    }

    function rtScanDrug() {
        const drugs = document.querySelectorAll('#rtStep4 .rt-drug');
        // If current drug is already done, find next undone
        if (drugs[rtActiveDrugIdx] && drugs[rtActiveDrugIdx].classList.contains('done')) {
            var found = false;
            for (var i = 0; i < drugs.length; i++) {
                if (!drugs[i].classList.contains('done')) {
                    rtPickDrug(drugs[i]);
                    found = true;
                    break;
                }
            }
            if (!found) { showToast('ให้ยาครบทุกรายการแล้ว'); setTimeout(function(){ showToast(''); }, 1500); return; }
        }
        const d = rtDrugs[rtActiveDrugIdx];
        if (!d) return;
        // Check drug interaction with already scanned drugs (done bar)
        var alreadyScannedRt = [];
        document.querySelectorAll('#rtStep4 .rt-drug').forEach(function(el, i) {
            if (el.querySelector('.rt-drug-bar.done') && i !== rtActiveDrugIdx) {
                alreadyScannedRt.push(rtDrugs[i].name);
            }
        });
        if (alreadyScannedRt.length > 0) {
            var interaction = checkDrugInteraction(d.name, alreadyScannedRt);
            if (interaction.found) { showInteractionModal(interaction); return; }
        }
        // If High Alert drug — require witness scan
        if (isHighAlertDrug(d.name)) {
            var lotHA = drugLotMap[d.name] || { lot:'N/A' };
            showHAVerifyModal(d.name, lotHA.lot, function() {
                rtDoScanDrug();
                showToast('พยานยืนยัน High Alert สำเร็จ — ' + d.name);
                setTimeout(function(){ showToast(''); }, 2000);
            }, "witness");
            return;
        }
        rtDoScanDrug();
    }
    function rtDoScanDrug() {
        const d = rtDrugs[rtActiveDrugIdx];
        if (!d) return;
        const lotInfo = drugLotMap[d.name] || { lot:'N/A', exp:'N/A' };
        // Update scan result
        const resultEl = document.getElementById('rtDrugScanResult');
        resultEl.innerHTML = '<div class="am-sr-head"><span class="am-sr-status pass">ผ่าน</span><span class="am-sr-name">' + d.name + '</span></div>'
            + '<div class="am-sr-grid">'
            + '<div><div class="am-sr-l">Lot</div><div class="am-sr-v">' + lotInfo.lot + '</div></div>'
            + '<div><div class="am-sr-l">Expiry</div><div class="am-sr-v">' + lotInfo.exp + '</div></div>'
            + '<div><div class="am-sr-l">Dose</div><div class="am-sr-v">' + d.dose + '</div></div>'
            + '<div><div class="am-sr-l">Route</div><div class="am-sr-v">' + d.route + '</div></div>'
            + '</div>';
        resultEl.classList.add('show');
        // Mark 7 Rights pass
        ['rtRD','rtRDs','rtRR'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.className = 'rt-r pass';
        });
        // Mark drug as done in list
        const drugs = document.querySelectorAll('#rtStep4 .rt-drug');
        if (drugs[rtActiveDrugIdx]) {
            var drugEl = drugs[rtActiveDrugIdx];
            drugEl.querySelector('.rt-drug-bar').className = 'rt-drug-bar done';
            drugEl.classList.remove('active');
            drugEl.classList.add('done');
            drugEl.style.opacity = '0.5';
            drugEl.style.pointerEvents = 'none';
        }
        document.getElementById('rtBtnConfirmDrug').disabled = false;
        showToast('สแกน ' + d.name + ' สำเร็จ — 7 Rights ผ่าน');
        setTimeout(() => showToast(''), 1500);
    }

    function rtResetDrugScan() {
        document.getElementById('rtDrugScanResult').classList.remove('show');
        ['rtRD','rtRDs','rtRR'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.className = 'rt-r pend';
        });
        document.getElementById('rtBtnConfirmDrug').disabled = true;
    }

    /* ── Legacy dispense pages: bind static screens to shared patient/drug data ── */
    const legacyDispenseOrder = ['10','03','01','02','05','08','12','15'];
    let currentLegacyDispenseBed = '01';
    let currentLegacyDrugIdx = 0;
    let legacyWitnessVerified = false;
    let legacyLastGivenTime = '08:15 น.';
    let assessmentListCache = [];

    function escHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, function(ch) {
            return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
        });
    }

    function parseDrugDesc(desc) {
        const parts = String(desc || '').split('·').map(function(p) { return p.trim(); });
        return { dose: parts[0] || '—', route: parts[1] || 'PO', schedule: parts[2] || 'รอบเช้า' };
    }

    function getDispensePatientKeys() {
        const seen = new Set();
        const keys = [];
        legacyDispenseOrder.forEach(function(key) {
            if (patientData[key]) { seen.add(key); keys.push(key); }
        });
        Object.keys(patientData).forEach(function(key) {
            if (!seen.has(key)) keys.push(key);
        });
        return keys;
    }

    function isPrnLegacyDrug(drug) {
        const parsed = parseDrugDesc(drug && drug.desc);
        return /prn/i.test(((drug && drug.desc) || '') + ' ' + parsed.schedule);
    }

    function getRoutineDispenseDrugs(pt) {
        return ((pt && pt.drugs) || []).filter(function(drug) {
            return !isPrnLegacyDrug(drug);
        });
    }

    function getRoutineDispensePatientKeys() {
        return getDispensePatientKeys().filter(function(key) {
            return getRoutineDispenseDrugs(patientData[key]).length > 0;
        });
    }

    function getLegacyPatient() {
        return patientData[currentLegacyDispenseBed] || patientData['01'];
    }

    function getLegacyDrugs() {
        const pt = getLegacyPatient();
        return getRoutineDispenseDrugs(pt);
    }

    function getLegacyDrug(idx) {
        const drugs = getLegacyDrugs();
        return drugs[idx ?? currentLegacyDrugIdx] || drugs[0] || {};
    }

    function isLegacyHighAlertDrug(drug) {
        return !!(drug && (drug.highAlert || isHighAlertDrug(drug.name || '')));
    }

    function legacyRouteFull(routeShort) {
        const map = {
            PO: 'PO (รับประทาน)',
            SC: 'SC (ฉีดใต้ผิวหนัง)',
            IV: 'IV (หลอดเลือดดำ)',
            IM: 'IM (ฉีดเข้ากล้ามเนื้อ)'
        };
        return map[routeShort] || routeShort || '—';
    }

    function legacyRoundTime(pt, drug) {
        const parsed = parseDrugDesc(drug && drug.desc);
        const text = (parsed.schedule + ' ' + (pt && pt.round || '')).toLowerCase();
        if (text.includes('prn')) return 'PRN';
        if (text.includes('เที่ยง')) return '12:00';
        if (text.includes('เย็น')) return '18:00';
        if (text.includes('ก่อนนอน')) return '21:00';
        return '08:00';
    }

    function legacyDrugView(drug, pt, idx) {
        const parsed = parseDrugDesc(drug.desc);
        const routeShort = parsed.route || 'PO';
        const lotInfo = drugLotMap[drug.name] || { lot:'N/A', exp:'N/A' };
        const highAlert = isLegacyHighAlertDrug(drug);
        const isPrn = /prn/i.test((drug.desc || '') + ' ' + parsed.schedule);
        return {
            name: drug.name || '—',
            dose: parsed.dose || '—',
            routeShort: routeShort,
            routeFull: legacyRouteFull(routeShort),
            time: legacyRoundTime(pt, drug),
            freq: parsed.schedule || (pt && pt.round) || '—',
            detail: routeShort + ' · ' + (parsed.dose || '—'),
            lot: lotInfo.lot,
            exp: lotInfo.exp,
            highAlert: highAlert,
            isPrn: isPrn,
            done: !!drug.done,
            statusClass: drug.done ? 'done' : 'wait',
            statusText: drug.done ? 'ให้แล้ว' : 'รอให้ยา',
            typeText: isPrn ? 'PRN' : (highAlert ? 'High Alert' : 'Routine'),
            idx: idx
        };
    }

    function opCleanText(value) {
        return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
    }

    function getOrderPlanOrders() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(ORDER_PLAN_STORE) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveOrderPlanOrders(orders) {
        try {
            sessionStorage.setItem(ORDER_PLAN_STORE, JSON.stringify(orders || []));
        } catch (e) {}
    }

    function updateOrderPlanStoredState(orderPlanId, fields) {
        if (!orderPlanId) return;
        let changed = false;
        const orders = getOrderPlanOrders().map(function(order) {
            if (order && order.id === orderPlanId) {
                changed = true;
                return Object.assign({}, order, fields || {});
            }
            return order;
        });
        if (changed) saveOrderPlanOrders(orders);
    }

    function orderPlanWardName() {
        return currentWardName || sessionStorage.getItem('mcWard') || DEFAULT_DEMO_WARD;
    }

    function getWardOrderPlanOrders(wardName, includeCancelled) {
        const ward = wardName || orderPlanWardName();
        return getOrderPlanOrders()
            .filter(function(order) {
                if (!order || order.ward !== ward) return false;
                return includeCancelled || order.status !== 'cancelled';
            })
            .sort(function(a, b) {
                return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
            });
    }

    function orderPlanPriorityLabel(priority) {
        return {
            routine: 'Routine',
            stat: 'STAT',
            prn: 'PRN',
            'high-alert': 'High Alert'
        }[priority] || 'Routine';
    }

    function orderPlanScheduleText(order) {
        const priority = order.priority || 'routine';
        const schedule = opCleanText(order.schedule || '');
        if (priority === 'stat') return 'STAT now';
        if (priority === 'prn') return schedule && schedule !== 'PRN' ? 'PRN ' + schedule : 'PRN ตามอาการ';
        return schedule || 'รอบเช้า';
    }

    function orderPlanDrugPalette(order) {
        const priority = order.priority || 'routine';
        const highAlert = priority === 'high-alert' || isHighAlertDrug(order.drugName || '');
        if (highAlert) return { color:'#EF4444', colorLight:['#FEF2F2','#FEE2E2'] };
        if (priority === 'stat') return { color:'#F59E0B', colorLight:['#FFFBEB','#FEF3C7'] };
        if (priority === 'prn') return { color:'#7C3AED', colorLight:['#F5F3FF','#EDE9FE'] };
        return { color:'#0D9488', colorLight:['#F0FDFA','#CCFBF1'] };
    }

    // Seed Order Plan from MedCartStore orders so Nurse Schedule page has data
    function seedOrderPlanFromMedCartStore() {
        if (typeof MedCartStore === 'undefined' || !MedCartStore.orders) return;
        var existing = getOrderPlanOrders();
        var existingByMed = {};
        existing.forEach(function(o) { if (o && o.medCartId) existingByMed[o.medCartId] = true; });
        var added = false;
        MedCartStore.orders.forEach(function(mc) {
            if (existingByMed[mc.id]) return;
            if (!mc.ward) return;
            if (mc.status === 'pending_verify' || mc.status === 'rejected') return;
            var pt = (typeof patientData !== 'undefined') ? patientData[mc.patient] : null;
            var dispensed = (mc.status === 'dispensed' || mc.status === 'assessed');
            var prepared = (mc.status === 'prepped' || dispensed);
            var isoBase = new Date(); isoBase.setHours(0,0,0,0);
            var createdIso = (mc.createdAt && /^\d{1,2}:\d{2}$/.test(mc.createdAt))
                ? new Date(isoBase.getTime() + (function(t){ var p=t.split(':'); return (parseInt(p[0])*3600+parseInt(p[1])*60)*1000; })(mc.createdAt)).toISOString()
                : isoBase.toISOString();
            var op = {
                id: 'OP-SEED-' + mc.id,
                medCartId: mc.id,
                ward: mc.ward,
                patientKey: mc.patient,
                patientName: pt ? pt.name : (MedCartStore.getPatientName(mc.patient) || '-'),
                hn: pt ? pt.hn : '',
                bed: pt ? pt.bed : (MedCartStore.getPatientBed(mc.patient) || '-'),
                drugName: mc.drug,
                dose: mc.dose || '',
                route: mc.route || 'PO',
                priority: mc.priority || 'routine',
                schedule: mc.schedule || 'รอบเช้า',
                source: mc.source === 'HIS' ? 'HIS Order' : (mc.orderSource || 'Verbal order'),
                doctor: mc.doctor || '',
                note: mc.note || '',
                status: 'active',
                prepared: prepared,
                done: dispensed,
                createdAt: createdIso,
                createdBy: mc.source === 'HIS' ? 'ระบบ HIS' : (mc.doctor || '-')
            };
            existing.push(op);
            added = true;
        });
        if (added) saveOrderPlanOrders(existing);
    }

    function orderPlanDrugFromOrder(order, existingDrug) {
        const palette = orderPlanDrugPalette(order);
        const done = existingDrug ? !!existingDrug.done : !!order.done;
        const scheduleText = orderPlanScheduleText(order);
        const route = opCleanText(order.route || 'PO').split(/\s+/)[0];
        return {
            name: opCleanText(order.drugName || 'Manual order'),
            desc: opCleanText(order.dose || '1 dose') + ' · ' + route + ' · ' + scheduleText,
            color: palette.color,
            colorLight: palette.colorLight,
            status: done ? (existingDrug && existingDrug.status ? existingDrug.status : 'ให้แล้ว ✓') : order.prepared ? 'จัดแล้ว ✓' : 'ยังไม่จัด',
            done: done,
            prepared: existingDrug ? !!existingDrug.prepared : !!order.prepared,
            highAlert: order.priority === 'high-alert' || isHighAlertDrug(order.drugName || ''),
            orderPlanId: order.id,
            manualOrder: true,
            orderSource: order.source || 'Order Plan',
            orderPriority: order.priority || 'routine',
            orderDoctor: order.doctor || '',
            orderNote: order.note || '',
            createdAt: order.createdAt || '',
            createdBy: order.createdBy || ''
        };
    }

    function applyOrderPlanOrdersToPatientData(wardName) {
        const ward = wardName || orderPlanWardName();
        const orders = getWardOrderPlanOrders(ward, false);
        orders.forEach(function(order) {
            const pt = patientData[order.patientKey];
            if (!pt) return;
            pt.drugs = pt.drugs || [];
            const existingIdx = pt.drugs.findIndex(function(drug) {
                return drug && drug.orderPlanId === order.id;
            });
            const existingDrug = existingIdx >= 0 ? pt.drugs[existingIdx] : null;
            const nextDrug = orderPlanDrugFromOrder(order, existingDrug);
            if (existingIdx >= 0) {
                pt.drugs[existingIdx] = Object.assign({}, existingDrug, nextDrug);
            } else {
                // Skip if a non-Order-Plan drug with the same name already exists (prevents HIS duplicate)
                const nameExists = pt.drugs.some(function(d) {
                    return d && !d.orderPlanId && d.name && nextDrug.name &&
                        d.name.toLowerCase() === nextDrug.name.toLowerCase();
                });
                if (!nameExists) pt.drugs.push(nextDrug);
            }
        });
    }

    function findOrderPlanDrug(orderId) {
        let found = null;
        Object.keys(patientData).some(function(key) {
            const pt = patientData[key];
            const drug = ((pt && pt.drugs) || []).find(function(item) {
                return item && item.orderPlanId === orderId;
            });
            if (drug) {
                found = drug;
                return true;
            }
            return false;
        });
        return found;
    }

    function removeOrderPlanDrug(orderId) {
        Object.keys(patientData).forEach(function(key) {
            const pt = patientData[key];
            if (!pt || !pt.drugs) return;
            pt.drugs = pt.drugs.filter(function(drug) {
                return !drug || drug.orderPlanId !== orderId;
            });
        });
        PatientDataNotifier.notify();
    }

    function orderPlanPatientOptionsHtml(selectedKey) {
        return prepPatientRows().map(function(row) {
            const selected = row.key === selectedKey ? ' selected' : '';
            const allergy = row.pt.allergy ? ' · ' + row.pt.allergy.replace(/^แพ้ยา:\s*/, 'แพ้ ') : '';
            return '<option value="' + escHtml(row.key) + '"' + selected + '>' + escHtml(row.pt.bed + ' · ' + row.pt.name + ' · HN ' + row.pt.hn + allergy) + '</option>';
        }).join('');
    }

    function orderPlanDrugOptionsHtml() {
        let names = [];
        try { names = Object.keys(drugLotMap || {}); } catch (e) { names = []; }
        ['Ceftriaxone 1 g','Fentanyl 25 mcg','Potassium Chloride 20 mEq','Salbutamol Neb','Ondansetron 4 mg'].forEach(function(name) {
            if (!names.includes(name)) names.push(name);
        });
        return names.sort().map(function(name) {
            return '<option value="' + escHtml(name) + '"></option>';
        }).join('');
    }

    function orderPlanSafetyChecks(pt, drugName, priority) {
        const checks = [];
        const normalized = normalizeIbfDrugName(drugName || '');
        const existingNames = ((pt && pt.drugs) || []).filter(function(drug) {
            return drug && !drug.done;
        }).map(function(drug) { return drug.name || ''; });
        const duplicate = normalized && existingNames.some(function(name) {
            return normalizeIbfDrugName(name) === normalized;
        });
        const allergyText = opCleanText((pt && pt.allergy || '').replace(/^แพ้ยา:\s*/, ''));
        const allergyConflict = !!(allergyText && drugName && normalizeInteractionDrugName(drugName).includes(normalizeInteractionDrugName(allergyText)));
        const highAlert = priority === 'high-alert' || isHighAlertDrug(drugName || '');
        const interaction = drugName ? getDrugInteractionProfile(drugName, existingNames) : { found:false, matches:[] };

        checks.push({
            type: pt && pt.allergy ? (allergyConflict ? 'danger' : 'warn') : 'ok',
            title: pt && pt.allergy ? (allergyConflict ? 'พบความเสี่ยงแพ้ยา' : 'ผู้ป่วยมีประวัติแพ้ยา') : 'ไม่พบข้อมูลแพ้ยาใน profile',
            sub: pt && pt.allergy ? pt.allergy : 'ยังต้องยืนยันกับผู้ป่วยตามขั้นตอนก่อนให้ยา'
        });
        checks.push({
            type: duplicate ? 'warn' : 'ok',
            title: duplicate ? 'พบรายการยาซ้ำใน MAR' : 'ไม่พบ duplicate order',
            sub: duplicate ? 'มีรายการ ' + drugName + ' ที่ยังไม่เสร็จในผู้ป่วยรายนี้' : 'ชื่อยานี้ยังไม่มีในรายการรอจัดของผู้ป่วย'
        });
        checks.push({
            type: highAlert ? 'danger' : 'ok',
            title: highAlert ? 'High Alert Drug' : 'ไม่ใช่ High Alert จากรายการที่รู้จัก',
            sub: highAlert ? 'ต้องตรวจสอบพยาน/IDC ในขั้นตอนจัดหรือให้ยา' : 'ระบบจะยังให้พยาบาลตรวจ 7 Rights ตามปกติ'
        });
        checks.push({
            type: interaction.found ? (interaction.severity === 'major' ? 'danger' : 'warn') : 'ok',
            title: interaction.found ? 'พบ Drug Interaction ' + (getInteractionSeverityConfig(interaction.severity).level || '') : 'ไม่พบ interaction ที่รู้จัก',
            sub: interaction.found ? interaction.drugName || (interaction.drug1 + ' กับ ' + interaction.drug2 + ' · ' + interaction.desc) : 'อ้างอิงจาก interaction rule ใน prototype'
        });
        return checks;
    }

    function isDrugPrn(drugName) {
        if (!drugName) return false;
        try {
            var overrides = JSON.parse(sessionStorage.getItem('boDrugMasterPrn') || '{}');
            var key = Object.keys(overrides).find(function(k){ return k.toLowerCase() === drugName.toLowerCase(); });
            if (key !== undefined) return !!overrides[key];
        } catch(e) {}
        var PRN_DEFAULTS = ['Paracetamol','Tramadol','Morphine','Celecoxib','Ibuprofen','Gabapentin','Metoclopramide','Ondansetron','Lorazepam','Diazepam'];
        return PRN_DEFAULTS.some(function(n){ return drugName.toLowerCase().indexOf(n.toLowerCase()) >= 0; });
    }

    function opUpdateSafetyPreview() {
        const patientKey = document.getElementById('opPatientSelect')?.value || getDispensePatientKeys()[0];
        const pt = patientData[patientKey];
        const drugName = opCleanText(document.getElementById('opDrugName')?.value || '');
        const priorityEl = document.getElementById('opPriority');
        const scheduleEl = document.getElementById('opSchedule');
        /* Auto-suggest PRN when drug is flagged as PRN in drug master */
        if (drugName && isDrugPrn(drugName) && priorityEl && priorityEl.value === 'routine') {
            priorityEl.value = 'prn';
            if (scheduleEl && scheduleEl.value !== 'PRN') scheduleEl.value = 'PRN';
        }
        const priority = priorityEl?.value || 'routine';
        const summary = document.getElementById('opPatientSummary');
        const checksEl = document.getElementById('opSafetyChecks');
        const badge = document.getElementById('opSafetyBadge');
        if (summary) {
            if (pt) {
                summary.innerHTML = '<div class="op-avatar">' + escHtml(pt.avatar || patientInitials(pt.name)) + '</div>'
                    + '<div style="min-width:0;flex:1;"><div style="font-size:14px;font-weight:850;color:var(--text-1);">' + escHtml(pt.name) + '</div>'
                    + '<div style="font-size:11px;color:var(--text-2);margin-top:3px;">HN: ' + escHtml(pt.hn) + ' · เตียง ' + escHtml(pt.bed) + ' · ' + escHtml(pt.age) + '</div>'
                    + '<div style="font-size:11px;color:' + (pt.allergy ? '#DC2626' : '#0D9488') + ';font-weight:750;margin-top:4px;">' + escHtml(pt.allergy || 'ไม่มีประวัติแพ้ยาใน profile') + '</div></div>';
            } else {
                summary.innerHTML = '<div class="op-empty" style="width:100%;padding:18px;">ยังไม่ได้เลือกผู้ป่วย</div>';
            }
        }
        if (!checksEl) return;
        const checks = orderPlanSafetyChecks(pt, drugName, priority);
        const hasDanger = checks.some(function(check) { return check.type === 'danger'; });
        const hasWarn = checks.some(function(check) { return check.type === 'warn'; });
        checksEl.innerHTML = checks.map(function(check) {
            return '<div class="op-check ' + check.type + '"><span class="op-check-dot"></span><div><div class="op-check-title">' + escHtml(check.title) + '</div><div class="op-check-sub">' + escHtml(check.sub) + '</div></div></div>';
        }).join('');
        if (badge) {
            badge.textContent = hasDanger ? 'ต้องทบทวน' : hasWarn ? 'มีข้อควรระวัง' : 'ผ่านเบื้องต้น';
            badge.style.background = hasDanger ? '#FEF2F2' : hasWarn ? '#FFFBEB' : '#F0FDFA';
            badge.style.color = hasDanger ? '#DC2626' : hasWarn ? '#B45309' : '#0F766E';
            badge.style.borderColor = hasDanger ? '#FECACA' : hasWarn ? '#FDE68A' : '#99F6E4';
        }
    }

    function renderOrderPlanDashboardHint() {
        const badge = document.getElementById('dashOrderPlanCount');
        if (!badge) return;
        const active = getWardOrderPlanOrders(orderPlanWardName(), false);
        const pending = active.filter(function(order) {
            const drug = findOrderPlanDrug(order.id);
            return !(drug && (drug.done || drug.prepared)) && !order.prepared && !order.done;
        }).length;
        badge.textContent = pending + ' รายการ';
        renderNurseScheduleDashboardHint();
        renderEmarDashboardHint();
    }

    function renderOrderPlanPage() {
        applyOrderPlanOrdersToPatientData(orderPlanWardName());
        const info = getCurrentWardInfo();
        const patientSelect = document.getElementById('opPatientSelect');
        const previousPatient = patientSelect ? patientSelect.value : '';
        if (patientSelect) {
            patientSelect.innerHTML = orderPlanPatientOptionsHtml(previousPatient);
            if (previousPatient && patientData[previousPatient]) patientSelect.value = previousPatient;
        }
        const drugOptions = document.getElementById('opDrugOptions');
        if (drugOptions) drugOptions.innerHTML = orderPlanDrugOptionsHtml();
        const wardLabel = document.getElementById('opWardLabel');
        const cartLabel = document.getElementById('opCartLabel');
        if (wardLabel) wardLabel.textContent = orderPlanWardName();
        if (cartLabel) cartLabel.textContent = info.cart || 'Med Cart A-1';

        const orders = getWardOrderPlanOrders(orderPlanWardName(), false);
        const activeOrders = orders.filter(function(order) { return order.status !== 'cancelled'; });
        const pendingOrders = activeOrders.filter(function(order) {
            const drug = findOrderPlanDrug(order.id);
            return !(drug && (drug.done || drug.prepared)) && !order.prepared && !order.done;
        });
        const highAlertOrders = activeOrders.filter(function(order) {
            return order.priority === 'high-alert' || isHighAlertDrug(order.drugName || '');
        });
        const prnStatOrders = activeOrders.filter(function(order) {
            return order.priority === 'prn' || order.priority === 'stat';
        });
        const statEls = {
            total: document.getElementById('opTotalOrders'),
            pending: document.getElementById('opPendingOrders'),
            ha: document.getElementById('opHighAlertOrders'),
            prn: document.getElementById('opPrnOrders')
        };
        if (statEls.total) statEls.total.textContent = activeOrders.length;
        if (statEls.pending) statEls.pending.textContent = pendingOrders.length;
        if (statEls.ha) statEls.ha.textContent = highAlertOrders.length;
        if (statEls.prn) statEls.prn.textContent = prnStatOrders.length;
        // ── MedCartStore manual orders: pending / approved / rejected ──
        var manualOrders = (typeof MedCartStore !== 'undefined') ? MedCartStore.orders.filter(function(o){ return o.source === 'Manual'; }) : [];
        var pendingCount = manualOrders.filter(function(o){ return o.status === 'pending_verify'; }).length;
        var approvedCount = manualOrders.filter(function(o){ return o.status !== 'pending_verify' && o.status !== 'rejected'; }).length;
        var rejectedCount = manualOrders.filter(function(o){ return o.status === 'rejected'; }).length;

        // Pending banner
        var banner = document.getElementById('opPendingBanner');
        if (banner) {
            if (pendingCount > 0) {
                banner.style.display = '';
                banner.innerHTML = '<div style="background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border:2px solid #FDE68A;border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;">'
                    +'<div style="width:40px;height:40px;background:linear-gradient(135deg,#D97706,#F59E0B);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
                    +'<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/></svg></div>'
                    +'<div style="flex:1;"><div style="font-size:14px;font-weight:800;color:#92400E;">รอเภสัชกรอนุมัติ ' + pendingCount + ' รายการ</div>'
                    +'<div style="font-size:11px;color:#B45309;margin-top:2px;">ยังจัดยาไม่ได้จนกว่าเภสัชจะอนุมัติคำสั่งยา</div></div></div>';
            } else if (approvedCount > 0) {
                banner.style.display = '';
                banner.innerHTML = '<div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px solid #86EFAC;border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;">'
                    +'<div style="width:40px;height:40px;background:linear-gradient(135deg,#059669,#10B981);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
                    +'<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
                    +'<div style="flex:1;"><div style="font-size:14px;font-weight:800;color:#065F46;">เภสัชอนุมัติแล้ว ' + approvedCount + ' รายการ</div>'
                    +'<div style="font-size:11px;color:#059669;margin-top:2px;">พร้อมจัดยาเข้า Cassette ได้เลย</div></div></div>';
            } else {
                banner.style.display = 'none';
            }
        }

        // Disable/enable ไปจัดยา button
        var prepBtn = document.getElementById('opGoPrepBtn');
        if (prepBtn) {
            if (pendingCount > 0 && currentRole === 'nurse') {
                prepBtn.disabled = true;
                prepBtn.style.opacity = '0.4';
                prepBtn.style.cursor = 'not-allowed';
                prepBtn.onclick = function(){ showToast('รอเภสัชกรอนุมัติก่อนจึงจัดยาได้'); setTimeout(function(){ showToast(''); },2000); };
            } else {
                prepBtn.disabled = false;
                prepBtn.style.opacity = '';
                prepBtn.style.cursor = '';
                prepBtn.onclick = function(){ goToPrepType(); };
            }
        }

        // Queue badge
        const queueBadge = document.getElementById('opQueueBadge');
        if (queueBadge) {
            if (pendingCount > 0) { queueBadge.textContent = pendingCount + ' รออนุมัติ'; queueBadge.style.background = '#FEF3C7'; queueBadge.style.color = '#92400E'; }
            else if (manualOrders.length > 0) { queueBadge.textContent = approvedCount + ' อนุมัติแล้ว'; queueBadge.style.background = '#DCFCE7'; queueBadge.style.color = '#065F46'; }
            else { queueBadge.textContent = '0 รายการ'; queueBadge.style.background = ''; queueBadge.style.color = ''; }
        }

        // Queue list — show MedCartStore manual orders split by status
        function opRenderManualRow(o) {
            var ptName = MedCartStore.getPatientName ? MedCartStore.getPatientName(o.patient) : o.patient;
            var isPending = o.status === 'pending_verify';
            var isRejected = o.status === 'rejected';
            var borderColor = isPending ? '#F59E0B' : isRejected ? '#EF4444' : '#10B981';
            var statusTag = isPending ? '<span class="op-tag" style="background:#FEF3C7;color:#92400E;border-color:#FDE68A;">รอเภสัชอนุมัติ</span>'
                : isRejected ? '<span class="op-tag" style="background:#FEE2E2;color:#DC2626;border-color:#FECACA;">ปฏิเสธ</span>'
                : '<span class="op-tag done">อนุมัติแล้ว</span>';
            var priTag = o.priority === 'stat' ? '<span class="op-tag stat">STAT</span>'
                : o.priority === 'high-alert' ? '<span class="op-tag ha">High Alert</span>'
                : o.priority === 'prn' ? '<span class="op-tag prn">PRN</span>' : '';
            return '<div class="op-order-row" style="border-left-color:' + borderColor + ';' + (isRejected ? 'opacity:0.5;' : '') + '">'
                + '<div class="op-order-main">'
                + '<div class="op-order-name">' + escHtml(o.drug) + ' ' + priTag + '</div>'
                + '<div class="op-order-meta">' + escHtml(ptName) + ' · ' + escHtml(o.dose||'') + ' · ' + escHtml(o.route||'') + ' · ' + escHtml(o.schedule||'') + '<br>แพทย์: ' + escHtml(o.doctor||'-') + ' · ' + escHtml(o.orderSource||o.source||'') + ' · ' + escHtml(o.createdAt||'') + '</div>'
                + '<div class="op-order-tags">' + statusTag + (isRejected && o.rejectReason ? '<span class="op-tag">เหตุผล: '+escHtml(o.rejectReason)+'</span>' : '') + '</div>'
                + '</div></div>';
        }
        var manualPending = manualOrders.filter(function(o){ return o.status === 'pending_verify'; });
        var manualApproved = manualOrders.filter(function(o){ return o.status !== 'pending_verify' && o.status !== 'rejected'; });
        var manualRejected = manualOrders.filter(function(o){ return o.status === 'rejected'; });

        const queue = document.getElementById('opQueueList');
        if (queue) {
            var html = '';
            // Pending section
            if (manualPending.length) {
                html += '<div style="padding:8px 12px;font-size:11px;font-weight:800;color:#92400E;background:#FEF3C7;border-radius:8px;margin:8px 0;">รอเภสัชอนุมัติ · ' + manualPending.length + ' รายการ</div>';
                html += manualPending.map(opRenderManualRow).join('');
            }
            // Approved section
            if (manualApproved.length) {
                html += '<div style="padding:8px 12px;font-size:11px;font-weight:800;color:#065F46;background:#DCFCE7;border-radius:8px;margin:8px 0;">อนุมัติแล้ว · ' + manualApproved.length + ' รายการ — พร้อมจัดยา</div>';
                html += manualApproved.map(opRenderManualRow).join('');
            }
            // Rejected section
            if (manualRejected.length) {
                html += '<div style="padding:8px 12px;font-size:11px;font-weight:800;color:#DC2626;background:#FEE2E2;border-radius:8px;margin:8px 0;">ปฏิเสธ · ' + manualRejected.length + ' รายการ</div>';
                html += manualRejected.map(opRenderManualRow).join('');
            }
            queue.innerHTML = html || '<div class="op-empty">ยังไม่มีรายการที่บันทึก</div>';
        }
        opUpdateSafetyPreview();
        renderOrderPlanDashboardHint();
    }

    function opAddOrder(event) {
        if (event) event.preventDefault();
        if (currentRole === 'pharma') {
            showToast('เภสัชกรไม่มีสิทธิ์เพิ่ม Order Plan');
            setTimeout(function(){ showToast(''); }, 1800);
            return false;
        }
        const patientKey = document.getElementById('opPatientSelect')?.value;
        const pt = patientData[patientKey];
        const drugName = opCleanText(document.getElementById('opDrugName')?.value || '');
        const dose = opCleanText(document.getElementById('opDose')?.value || '');
        const route = opCleanText(document.getElementById('opRoute')?.value || 'PO').split(/\s+/)[0];
        const priority = document.getElementById('opPriority')?.value || 'routine';
        const schedule = opCleanText(document.getElementById('opSchedule')?.value || 'รอบเช้า');
        const source = opCleanText(document.getElementById('opSource')?.value || 'Verbal order');
        const doctor = opCleanText(document.getElementById('opDoctor')?.value || '');
        const note = opCleanText(document.getElementById('opNote')?.value || '');
        if (!pt || !drugName || !dose) {
            showToast('กรุณาเลือกผู้ป่วย กรอกชื่อยา และ Dose ให้ครบ');
            setTimeout(function(){ showToast(''); }, 2200);
            return false;
        }
        const existingNames = (pt.drugs || []).filter(function(drug) { return drug && !drug.done; }).map(function(drug) { return drug.name || ''; });
        const duplicate = existingNames.some(function(name) {
            return normalizeIbfDrugName(name) === normalizeIbfDrugName(drugName);
        });
        if (duplicate && !confirm('พบรายการยาซ้ำที่ยังไม่เสร็จในผู้ป่วยรายนี้ ต้องการเพิ่มต่อหรือไม่?')) {
            return false;
        }
        const interaction = getDrugInteractionProfile(drugName, existingNames);
        if (interaction.found && interaction.severity === 'major' && !confirm('พบ Major Drug Interaction: ' + interaction.drug1 + ' กับ ' + interaction.drug2 + '\nต้องการเพิ่ม Order Plan ต่อหรือไม่?')) {
            return false;
        }
        const now = new Date();
        const order = {
            id: 'OP-' + now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
            ward: orderPlanWardName(),
            patientKey: patientKey,
            patientName: pt.name,
            hn: pt.hn,
            bed: pt.bed,
            drugName: drugName,
            dose: dose,
            route: route,
            priority: priority,
            schedule: schedule,
            source: source,
            doctor: doctor,
            note: note,
            status: 'active',
            createdAt: now.toISOString(),
            createdBy: sessionStorage.getItem('mcName') || 'นส.สมใจ ดีมาก'
        };
        // Add to MedCartStore FIRST → pending_verify for pharmacist
        try {
            if (typeof MedCartStore !== 'undefined') {
                MedCartStore.addManualOrder({
                    patient: patientKey,
                    drug: drugName,
                    dose: dose,
                    route: route,
                    priority: priority,
                    schedule: schedule,
                    time: schedule === 'STAT now' ? 'STAT' : schedule === 'PRN' ? 'PRN' : '',
                    doctor: doctor,
                    note: note,
                    orderSource: source,
                    highAlert: priority === 'high-alert',
                    ward: orderPlanWardName(),
                    orderPlanId: order.id
                });
            }
        } catch(e) {}

        // Also save to Order Plan system
        try {
            var orders = getOrderPlanOrders();
            orders.push(order);
            saveOrderPlanOrders(orders);
            applyOrderPlanOrdersToPatientData(order.ward);
            syncWardFlowDatasets();
        } catch(e) {}

        ['opDrugName','opDose','opNote'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        renderOrderPlanPage();
        showToast('ส่งรอเภสัชอนุมัติแล้ว — ' + drugName);
        setTimeout(function(){ showToast(''); }, 2200);
        return false;
    }

    function opCancelOrder(orderId) {
        const drug = findOrderPlanDrug(orderId);
        if (drug && drug.done) {
            showToast('รายการนี้ให้ยาแล้ว ไม่ควรยกเลิกจาก Order Plan');
            setTimeout(function(){ showToast(''); }, 2200);
            return;
        }
        if (!confirm('ยกเลิก Order Plan รายการนี้หรือไม่?')) return;
        const orders = getOrderPlanOrders().map(function(order) {
            if (order.id === orderId) return Object.assign({}, order, { status:'cancelled', cancelledAt:new Date().toISOString() });
            return order;
        });
        saveOrderPlanOrders(orders);
        removeOrderPlanDrug(orderId);
        syncWardFlowDatasets();
        renderOrderPlanPage();
        showToast('ยกเลิก Order Plan แล้ว');
        setTimeout(function(){ showToast(''); }, 1600);
    }

    function opOpenPatientPrep(orderId) {
        const order = getOrderPlanOrders().find(function(item) { return item.id === orderId; });
        if (!order || !patientData[order.patientKey]) {
            nav('pg-prep-patient');
            return;
        }
        goToPatientDrugs(order.patientKey);
    }

    let nsCurrentFilter = 'all';

    function nurseScheduleStatus(order) {
        const drug = findOrderPlanDrug(order && order.id);
        if ((drug && drug.done) || (order && order.done) || (order && order.status === 'given')) {
            return { key:'given', label:'ให้ยาแล้ว', progress:3, tag:'done' };
        }
        if ((drug && drug.prepared) || (order && order.prepared)) {
            return { key:'prepared', label:'จัดแล้ว', progress:2, tag:'done' };
        }
        return { key:'pending', label:'รอจัดยา', progress:1, tag:'' };
    }

    function nurseScheduleRoundConfig(order) {
        const schedule = orderPlanScheduleText(order);
        const priority = (order && order.priority) || 'routine';
        if (priority === 'stat' || /stat|ทันที/i.test(schedule)) {
            return { key:'stat', label:'STAT / ให้ทันที', time:'Now', rank:0, color:'#DC2626', bg:'#FEF2F2', border:'#FECACA' };
        }
        if (priority === 'prn' || /prn/i.test(schedule)) {
            return { key:'prn', label:'PRN ตามอาการ', time:'ตามอาการ', rank:5, color:'#6D28D9', bg:'#F5F3FF', border:'#DDD6FE' };
        }
        if (/เที่ยง|12:00/.test(schedule)) {
            return { key:'noon', label:'รอบเที่ยง', time:'11:00-12:00', rank:2, color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' };
        }
        if (/เย็น|18:00/.test(schedule)) {
            return { key:'evening', label:'รอบเย็น', time:'16:00-18:00', rank:3, color:'#EA580C', bg:'#FFF7ED', border:'#FDBA74' };
        }
        if (/ก่อนนอน|21:00|22:00/.test(schedule)) {
            return { key:'bedtime', label:'ก่อนนอน', time:'20:00-22:00', rank:4, color:'#4F46E5', bg:'#EEF2FF', border:'#C7D2FE' };
        }
        return { key:'morning', label:'รอบเช้า', time:'06:00-08:00', rank:1, color:'#0D9488', bg:'#F0FDFA', border:'#99F6E4' };
    }

    function nurseScheduleRows() {
        applyOrderPlanOrdersToPatientData(orderPlanWardName());
        return getWardOrderPlanOrders(orderPlanWardName(), false).map(function(order) {
            const pt = patientData[order.patientKey] || {};
            const status = nurseScheduleStatus(order);
            const round = nurseScheduleRoundConfig(order);
            const highAlert = order.priority === 'high-alert' || isHighAlertDrug(order.drugName || '');
            return {
                order: order,
                pt: pt,
                status: status,
                round: round,
                highAlert: highAlert
            };
        }).sort(function(a, b) {
            if (a.round.rank !== b.round.rank) return a.round.rank - b.round.rank;
            if (a.status.progress !== b.status.progress) return a.status.progress - b.status.progress;
            return String(a.order.createdAt || '').localeCompare(String(b.order.createdAt || ''));
        });
    }

    function nurseScheduleFilterMatch(row) {
        if (nsCurrentFilter === 'all') return true;
        if (nsCurrentFilter === 'high-alert') return !!row.highAlert;
        return row.status.key === nsCurrentFilter;
    }

    function nsSetFilter(filter, btn) {
        nsCurrentFilter = filter || 'all';
        document.querySelectorAll('#nsFilterTabs .ns-filter-btn').forEach(function(item) {
            item.classList.remove('active');
        });
        if (btn) btn.classList.add('active');
        renderNurseSchedulePage();
    }

    function nurseScheduleItemHtml(row) {
        const order = row.order;
        const pt = row.pt || {};
        const palette = orderPlanDrugPalette(order);
        const priority = order.priority || 'routine';
        const priorityClass = priority === 'stat' ? ' stat' : priority === 'prn' ? ' prn' : row.highAlert ? ' ha' : '';
        const progress = Math.max(Math.min(row.status.progress, 3), 1);
        const stepHtml = [1,2,3].map(function(step) {
            return '<span class="ns-step' + (step <= progress ? ' on' : '') + '"></span>';
        }).join('');
        const actionLabel = row.status.key === 'pending' ? 'จัดยา' : 'ดูรายการยา';
        const isPharmaRole = (typeof currentRole !== 'undefined' && currentRole === 'pharma');
        const actionBtnHtml = isPharmaRole ? '' : '<div class="ns-action-row"><button type="button" class="op-btn" onclick="nsOpenScheduleOrder(\'' + escHtml(order.id) + '\')">' + actionLabel + '</button></div>';
        const pharmaClass = isPharmaRole ? ' ns-readonly' : '';
        return '<div class="ns-item' + pharmaClass + '" style="border-left-color:' + palette.color + ';">'
            + '<div class="ns-item-main">'
            + '<div class="ns-patient"><span>' + escHtml(pt.bed || order.bed || '-') + '</span><span>' + escHtml(pt.name || order.patientName || '-') + '</span>' + (row.highAlert ? '<span class="op-tag ha">High Alert</span>' : '') + '</div>'
            + '<div class="ns-med">' + escHtml(order.drugName) + haBadge(order.drugName) + ' · ' + escHtml(order.dose) + ' · ' + escHtml(order.route) + '<br>' + escHtml(order.source || 'Order Plan') + (order.doctor ? ' · ' + escHtml(order.doctor) : '') + (order.note ? ' · ' + escHtml(order.note) : '') + '</div>'
            + '<div class="ns-meta"><span class="op-tag' + priorityClass + '">' + escHtml(orderPlanPriorityLabel(priority)) + '</span><span class="op-tag">' + escHtml(row.round.label) + '</span><span class="op-tag' + (row.status.tag ? ' ' + row.status.tag : '') + '">' + escHtml(row.status.label) + '</span></div>'
            + '</div>'
            + '<div class="ns-progress">'
            + '<div class="ns-step-track">' + stepHtml + '</div>'
            + '<div style="font-size:10px;color:var(--text-3);font-weight:800;">Order → Prep → Admin</div>'
            + actionBtnHtml
            + '</div>'
            + '</div>';
    }

    function nurseScheduleRoundHtml(round, rows) {
        return '<div class="ns-round" style="border-color:' + round.border + ';">'
            + '<div class="ns-round-head">'
            + '<div class="ns-round-title"><span style="width:10px;height:10px;border-radius:999px;background:' + round.color + ';display:inline-block;"></span>' + escHtml(round.label) + '<span class="ns-round-time" style="color:' + round.color + ';background:' + round.bg + ';border-color:' + round.border + ';">' + escHtml(round.time) + '</span></div>'
            + '<span class="ns-round-count">' + rows.length + ' รายการ</span>'
            + '</div>'
            + '<div class="ns-items">' + rows.map(nurseScheduleItemHtml).join('') + '</div>'
            + '</div>';
    }

    function renderNurseScheduleDashboardHint() {
        const badge = document.getElementById('dashNurseScheduleCount');
        if (!badge) return;
        const rows = nurseScheduleRows();
        const pending = rows.filter(function(row) { return row.status.key === 'pending'; }).length;
        badge.textContent = pending + ' รอจัด';
    }

    function renderNurseSchedulePage() {
        const info = getCurrentWardInfo();
        const wardLabel = document.getElementById('nsWardLabel');
        const cartLabel = document.getElementById('nsCartLabel');
        if (wardLabel) wardLabel.textContent = orderPlanWardName();
        if (cartLabel) cartLabel.textContent = info.cart || 'Med Cart A-1';

        const rows = nurseScheduleRows();
        const filtered = rows.filter(nurseScheduleFilterMatch);
        const pending = rows.filter(function(row) { return row.status.key === 'pending'; }).length;
        const prepared = rows.filter(function(row) { return row.status.key === 'prepared'; }).length;
        const given = rows.filter(function(row) { return row.status.key === 'given'; }).length;
        const highAlert = rows.filter(function(row) { return row.highAlert; }).length;
        const statEls = {
            total: document.getElementById('nsTotalOrders'),
            pending: document.getElementById('nsPendingPrep'),
            prepared: document.getElementById('nsPrepared'),
            given: document.getElementById('nsGiven')
        };
        if (statEls.total) statEls.total.textContent = rows.length;
        if (statEls.pending) statEls.pending.textContent = pending;
        if (statEls.prepared) statEls.prepared.textContent = prepared;
        if (statEls.given) statEls.given.textContent = given;
        const badge = document.getElementById('nsTimelineBadge');
        if (badge) badge.textContent = filtered.length + ' รายการ';
        const sourceBadge = document.getElementById('nsSourceBadge');
        if (sourceBadge) sourceBadge.textContent = 'High Alert ' + highAlert;

        const timeline = document.getElementById('nsTimeline');
        if (timeline) {
            const groups = {};
            filtered.forEach(function(row) {
                if (!groups[row.round.key]) groups[row.round.key] = { round: row.round, rows: [] };
                groups[row.round.key].rows.push(row);
            });
            const groupHtml = Object.values(groups).sort(function(a, b) {
                return a.round.rank - b.round.rank;
            }).map(function(group) {
                return nurseScheduleRoundHtml(group.round, group.rows);
            }).join('');
            timeline.innerHTML = groupHtml || '<div class="op-empty">ยังไม่มีรายการจาก Order Plan ใน filter นี้</div>';
        }

        const side = document.getElementById('nsSideSummary');
        if (side) {
            const rounds = {};
            rows.forEach(function(row) {
                if (!rounds[row.round.key]) rounds[row.round.key] = { label: row.round.label, count: 0, pending: 0 };
                rounds[row.round.key].count++;
                if (row.status.key === 'pending') rounds[row.round.key].pending++;
            });
            const roundItems = Object.values(rounds).map(function(item) {
                return '<div class="ns-side-item"><div class="ns-side-label">' + escHtml(item.label) + '</div><div class="ns-side-value">' + item.count + '</div><div class="ns-side-note">รอจัด ' + item.pending + ' รายการ</div></div>';
            }).join('');
            side.innerHTML =
                '<div class="ns-side-item"><div class="ns-side-label">Ward Scope</div><div class="ns-side-value">' + escHtml(orderPlanWardName()) + '</div><div class="ns-side-note">' + escHtml(info.cart || 'Med Cart A-1') + ' · จากรายการ Order Plan ที่ active</div></div>'
                + '<div class="ns-side-item"><div class="ns-side-label">Priority</div><div class="ns-side-value">' + highAlert + '</div><div class="ns-side-note">High Alert ต้องตรวจพยาน/IDC ก่อนจัดหรือให้ยา</div></div>'
                + (roundItems || '<div class="ns-side-item"><div class="ns-side-label">ยังไม่มีรอบยา</div><div class="ns-side-note">เพิ่มรายการจาก Order Plan ก่อนเพื่อให้ Schedule แสดงผล</div></div>');
        }
        renderNurseScheduleDashboardHint();
    }

    function nsOpenScheduleOrder(orderId) {
        const order = getOrderPlanOrders().find(function(item) { return item.id === orderId; });
        if (!order || !patientData[order.patientKey]) {
            nav('pg-order-plan');
            return;
        }
        const status = nurseScheduleStatus(order);
        if (status.key === 'pending') {
            opOpenPatientPrep(orderId);
        } else {
            openDispensePatient(order.patientKey);
        }
    }

    function jsArg(value) {
        return escHtml(JSON.stringify(String(value || '')));
    }

    function emarWardName() {
        return orderPlanWardName();
    }

    function emarCurrentTimeLabel() {
        return new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }) + ' น.';
    }

    function emarDateKey(value) {
        const d = value ? new Date(value) : new Date();
        if (Number.isNaN(d.getTime())) return '';
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function emarIsToday(record) {
        return emarDateKey(record && record.recordedAt) === emarDateKey();
    }

    function getEmarRecords() {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(EMAR_RECORD_STORE) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveEmarRecords(records) {
        try {
            sessionStorage.setItem(EMAR_RECORD_STORE, JSON.stringify(records || []));
        } catch (e) {}
    }

    function getWardEmarRecords(wardName) {
        const ward = wardName || emarWardName();
        return getEmarRecords()
            .filter(function(record) { return record && record.ward === ward; })
            .sort(function(a, b) { return String(b.recordedAt || '').localeCompare(String(a.recordedAt || '')); });
    }

    function emarSourceRef(row) {
        const drug = (row && row.drug) || {};
        const view = (row && row.view) || {};
        const stableDrug = drug.orderPlanId || normalizeIbfDrugName(drug.name || view.name || '');
        return ['MAR', emarWardName(), row && row.key, row && row.idx, stableDrug].join(':');
    }

    function recordEmarAdministration(record) {
        const now = new Date();
        const base = Object.assign({
            id: 'EMAR-' + now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
            ward: emarWardName(),
            offCart: false,
            rights: EMAR_RIGHTS.map(function(item) { return item.key; }),
            recordedAt: now.toISOString(),
            recordedTime: now.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }) + ' น.',
            recordedBy: sessionStorage.getItem('mcName') || 'นส.สมใจ ดีมาก'
        }, record || {});
        const records = getEmarRecords();
        if (base.sourceRef) {
            const existingIdx = records.findIndex(function(item) {
                return item && item.sourceRef === base.sourceRef && item.ward === base.ward && !item.reversed;
            });
            if (existingIdx >= 0) {
                records[existingIdx] = Object.assign({}, records[existingIdx], base, {
                    id: records[existingIdx].id || base.id,
                    recordedAt: records[existingIdx].recordedAt || base.recordedAt
                });
                saveEmarRecords(records);
                return records[existingIdx];
            }
        }
        records.unshift(base);
        saveEmarRecords(records);
        return base;
    }

    function emarMedicationRows() {
        applyOrderPlanOrdersToPatientData(emarWardName());
        const rows = [];
        getDispensePatientKeys().forEach(function(key) {
            const pt = patientData[key];
            if (!pt) return;
            (pt.drugs || []).forEach(function(drug, idx) {
                if (!drug) return;
                const view = legacyDrugView(drug, pt, idx);
                const ref = key + ':' + idx;
                const highAlert = !!(drug.highAlert || view.highAlert || isHighAlertDrug(view.name || ''));
                rows.push({
                    ref: ref,
                    key: key,
                    idx: idx,
                    pt: pt,
                    drug: drug,
                    view: view,
                    highAlert: highAlert,
                    prn: !!view.isPrn,
                    orderPlan: !!drug.orderPlanId,
                    done: !!drug.done
                });
            });
        });
        return rows.sort(function(a, b) {
            if (a.done !== b.done) return a.done ? 1 : -1;
            if (a.highAlert !== b.highAlert) return a.highAlert ? -1 : 1;
            const timeA = String(a.view.time || '');
            const timeB = String(b.view.time || '');
            if (timeA !== timeB) return timeA.localeCompare(timeB, 'th', { numeric:true, sensitivity:'base' });
            return String(a.pt.bed || a.key).localeCompare(String(b.pt.bed || b.key), 'th', { numeric:true, sensitivity:'base' });
        });
    }

    function emarSelectedRow(rows) {
        rows = rows || emarMedicationRows();
        let selected = rows.find(function(row) { return row.ref === emarSelectedRef; });
        if (!selected) {
            selected = rows.find(function(row) { return !row.done; }) || rows[0] || null;
            emarSelectedRef = selected ? selected.ref : '';
        }
        return selected;
    }

    function emarFilterMatch(row) {
        if (emarCurrentFilter === 'all') return true;
        if (emarCurrentFilter === 'pending') return !row.done;
        if (emarCurrentFilter === 'done') return row.done;
        if (emarCurrentFilter === 'high-alert') return row.highAlert;
        if (emarCurrentFilter === 'order-plan') return row.orderPlan;
        if (emarCurrentFilter === 'hold') {
            var records = (typeof getWardEmarRecords === 'function') ? getWardEmarRecords(emarWardName()) : [];
            var ref = row.key + ':' + row.idx;
            return records.some(function(r) { return r.sourceRef === ref && r.holdOmit === 'hold'; })
                || (row.drug && row.drug.holdOmit === 'hold');
        }
        if (emarCurrentFilter === 'omit') {
            var records2 = (typeof getWardEmarRecords === 'function') ? getWardEmarRecords(emarWardName()) : [];
            var ref2 = row.key + ':' + row.idx;
            return records2.some(function(r) { return r.sourceRef === ref2 && r.holdOmit === 'omit'; })
                || (row.drug && row.drug.holdOmit === 'omit');
        }
        if (emarCurrentFilter === 'offcart') {
            var records3 = (typeof getWardEmarRecords === 'function') ? getWardEmarRecords(emarWardName()) : [];
            return records3.some(function(r) {
                return r.patientKey === row.key && r.offCart && (typeof emarIsToday === 'function' ? emarIsToday(r) : true);
            });
        }
        return true;
    }

    function emarSetFilter(filter, btn) {
        emarCurrentFilter = filter || 'all';
        document.querySelectorAll('#emarFilterTabs .ns-filter-btn').forEach(function(item) {
            item.classList.remove('active');
        });
        if (btn) btn.classList.add('active');
        renderEmarPage();
    }

    function emarSelect(ref) {
        emarSelectedRef = ref || '';
        renderEmarPage();
    }

    function emarRightDetail(row, key) {
        if (!row) return '';
        if (key === 'patient') return row.pt.name + ' · HN ' + row.pt.hn + ' · เตียง ' + row.pt.bed;
        if (key === 'medication') return row.view.name;
        if (key === 'dose') return row.view.dose;
        if (key === 'route') return row.view.routeFull;
        if (key === 'time') return row.view.time === 'PRN' ? 'PRN ตามอาการ' : row.view.time + ' น. · ' + row.view.freq;
        if (key === 'reason') return row.drug.orderNote || row.drug.orderSource || (row.prn ? 'PRN ตามอาการ' : 'ตาม MAR');
        if (key === 'documentation') return 'บันทึกโดย ' + (sessionStorage.getItem('mcName') || 'นส.สมใจ ดีมาก') + ' · ' + emarCurrentTimeLabel();
        return '';
    }

    function emarRightsHtml(row) {
        return '<div class="emar-rights">' + EMAR_RIGHTS.map(function(item) {
            return '<label class="emar-right">'
                + '<input class="emar-right-input" type="checkbox" data-right="' + escHtml(item.key) + '" checked>'
                + '<div><strong>' + escHtml(item.thai) + ' · ' + escHtml(item.label) + '</strong><span>' + escHtml(emarRightDetail(row, item.key)) + '</span></div>'
                + '</label>';
        }).join('') + '</div>';
    }

    function emarSelectedPanelHtml(row) {
        if (!row) {
            return '<div class="op-empty">เลือกรายการยาเพื่อดูรายละเอียด</div>';
        }
        const done = row.done;
        const status = done ? 'ให้ยาแล้ว ' + (row.drug.givenTime || row.view.time || '') : 'รอให้ยา';
        const source = row.orderPlan ? 'Order Plan' : 'MAR';
        const highAlert = row.highAlert ? '<span class="op-tag ha">High Alert</span>' : '';
        const prn = row.prn ? '<span class="op-tag prn">PRN</span>' : '';
        var statusBadge = done
            ? '<span style="display:inline-flex;align-items:center;gap:4px;background:#DCFCE7;color:#059669;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;border:1px solid #BBF7D0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>ให้ยาแล้ว</span>'
            : '<span style="display:inline-flex;align-items:center;gap:4px;background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;border:1px solid #FDE68A;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>รอให้ยา</span>';
        return '<div class="emar-selected-head">'
            + '<div class="emar-selected-name">' + escHtml(row.view.name) + haBadge(row.view.name) + highAlert + prn + '</div>'
            + '<div class="emar-selected-meta">' + escHtml(row.pt.name) + ' · HN ' + escHtml(row.pt.hn) + ' · เตียง ' + escHtml(row.pt.bed) + '</div>'
            + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0;">'
            + '<div style="background:#F8FAFC;border-radius:10px;padding:10px 12px;"><div style="font-size:10px;color:var(--text-3);font-weight:600;">Dose</div><div style="font-size:13px;font-weight:700;color:var(--text-1);margin-top:2px;">' + escHtml(row.view.dose) + '</div></div>'
            + '<div style="background:#F8FAFC;border-radius:10px;padding:10px 12px;"><div style="font-size:10px;color:var(--text-3);font-weight:600;">Route</div><div style="font-size:13px;font-weight:700;color:var(--text-1);margin-top:2px;">' + escHtml(row.view.routeFull) + '</div></div>'
            + '<div style="background:#F8FAFC;border-radius:10px;padding:10px 12px;"><div style="font-size:10px;color:var(--text-3);font-weight:600;">เวลา / รอบ</div><div style="font-size:13px;font-weight:700;color:var(--text-1);margin-top:2px;">' + escHtml(row.view.time) + ' · ' + escHtml(row.view.freq) + '</div></div>'
            + '<div style="background:#F8FAFC;border-radius:10px;padding:10px 12px;"><div style="font-size:10px;color:var(--text-3);font-weight:600;">ที่มา</div><div style="font-size:13px;font-weight:700;color:var(--text-1);margin-top:2px;">' + escHtml(source) + '</div></div>'
            + '</div>'
            + '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border);">'
            + '<div style="font-size:12px;color:var(--text-2);">' + escHtml(status) + (row.highAlert ? ' · ต้องมีพยาน' : '') + '</div>'
            + statusBadge
            + '</div>';
    }

    function emarRowHtml(row) {
        const color = row.highAlert ? '#EF4444' : row.orderPlan ? orderPlanDrugPalette({ priority: row.drug.orderPriority || 'routine', drugName: row.view.name }).color : (row.drug.color || '#0D9488');
        const active = row.ref === emarSelectedRef ? ' active' : '';
        const doneClass = row.done ? ' done' : '';
        const statusClass = row.done ? 'done' : 'pending';
        const priorityTag = row.highAlert ? '<span class="op-tag ha">High Alert</span>' : row.prn ? '<span class="op-tag prn">PRN</span>' : '<span class="op-tag">Routine</span>';
        const sourceTag = row.orderPlan ? '<span class="op-tag done">Order Plan</span>' : '<span class="op-tag">MAR</span>';
        const statusText = row.done ? 'ให้ยาแล้ว' : 'รอให้ยา';
        return '<div class="emar-row' + active + doneClass + '" style="border-left-color:' + color + ';" onclick="emarSelect(' + jsArg(row.ref) + ')">'
            + '<div class="emar-row-main">'
            + '<div class="emar-patient"><span>' + escHtml(row.pt.bed) + '</span><span>' + escHtml(row.pt.name) + '</span></div>'
            + '<div class="emar-med">' + escHtml(row.view.name) + haBadge(row.view.name) + ' · ' + escHtml(row.view.dose) + ' · ' + escHtml(row.view.routeShort) + '<br>' + escHtml(row.view.time) + ' · ' + escHtml(row.view.freq) + '</div>'
            + '<div class="emar-tags">' + priorityTag + sourceTag + (row.drug.prepared ? '<span class="op-tag done">จัดแล้ว</span>' : '') + '</div>'
            + '</div>'
            + '<div class="emar-row-side">'
            + '<span class="emar-status ' + statusClass + '">' + escHtml(statusText) + '</span>'
            + '</div>'
            + '</div>';
    }

    function emarRecordFromRow(row, givenTime, note) {
        return {
            ward: emarWardName(),
            sourceRef: emarSourceRef(row),
            patientKey: row.key,
            patientName: row.pt.name,
            hn: row.pt.hn,
            bed: row.pt.bed,
            drugName: row.view.name,
            dose: row.view.dose,
            route: row.view.routeShort,
            routeFull: row.view.routeFull,
            schedule: row.view.freq,
            dueTime: row.view.time,
            givenTime: givenTime || emarCurrentTimeLabel(),
            highAlert: row.highAlert,
            prn: row.prn,
            orderPlanId: row.drug.orderPlanId || '',
            source: row.orderPlan ? (row.drug.orderSource || 'Order Plan') : 'MAR',
            offCart: false,
            note: note || ''
        };
    }

    function emarRightsComplete() {
        const checks = Array.from(document.querySelectorAll('#emarSelectedCard .emar-right-input'));
        return checks.length > 0 && checks.every(function(input) { return input.checked; });
    }

    function emarRecordSelected() {
        if (currentRole === 'pharma') {
            showToast('เภสัชกรไม่มีสิทธิ์บันทึก eMAR');
            setTimeout(function(){ showToast(''); }, 1800);
            return;
        }
        const rows = emarMedicationRows();
        const row = emarSelectedRow(rows);
        if (!row || !row.drug) return;
        if (row.done) {
            showToast('รายการนี้ถูกบันทึกให้ยาแล้ว');
            setTimeout(function(){ showToast(''); }, 1600);
            return;
        }
        if (!emarRightsComplete()) {
            showToast('กรุณายืนยัน 7 Rights ให้ครบก่อนบันทึก');
            setTimeout(function(){ showToast(''); }, 2200);
            return;
        }
        const givenTime = emarCurrentTimeLabel();
        const note = opCleanText(document.getElementById('emarAdminNote')?.value || '');
        row.drug.done = true;
        row.drug.status = 'ให้แล้ว ✓';
        row.drug.givenTime = givenTime;
        if (row.drug.orderPlanId) {
            updateOrderPlanStoredState(row.drug.orderPlanId, {
                done: true,
                givenAt: givenTime,
                status: 'given'
            });
        }
        recordEmarAdministration(emarRecordFromRow(row, givenTime, note));
        syncWardFlowDatasets();
        PatientDataNotifier.notify();
        showToast('บันทึก eMAR แล้ว — ' + row.view.name);
        setTimeout(function(){ showToast(''); }, 2000);
    }

    function emarRecordOffCart(event) {
        if (event) event.preventDefault();
        if (currentRole === 'pharma') {
            showToast('เภสัชกรไม่มีสิทธิ์บันทึก eMAR');
            setTimeout(function(){ showToast(''); }, 1800);
            return false;
        }
        const patientKey = document.getElementById('emarOffPatient')?.value;
        const pt = patientData[patientKey];
        const drugName = opCleanText(document.getElementById('emarOffDrug')?.value || '');
        const dose = opCleanText(document.getElementById('emarOffDose')?.value || '');
        const route = opCleanText(document.getElementById('emarOffRoute')?.value || 'PO');
        const source = opCleanText(document.getElementById('emarOffSource')?.value || 'Ward stock');
        const reason = opCleanText(document.getElementById('emarOffReason')?.value || '');
        const rightConfirmed = !!document.getElementById('emarOffRightConfirm')?.checked;
        if (!pt || !drugName || !dose || !reason) {
            showToast('กรุณาเลือกผู้ป่วย กรอกชื่อยา Dose และเหตุผล Off-cart');
            setTimeout(function(){ showToast(''); }, 2400);
            return false;
        }
        if (!rightConfirmed) {
            showToast('กรุณายืนยัน 7 Rights ก่อนบันทึก Off-cart');
            setTimeout(function(){ showToast(''); }, 2200);
            return false;
        }
        const givenTime = emarCurrentTimeLabel();
        recordEmarAdministration({
            ward: emarWardName(),
            patientKey: patientKey,
            patientName: pt.name,
            hn: pt.hn,
            bed: pt.bed,
            drugName: drugName,
            dose: dose,
            route: route,
            routeFull: legacyRouteFull(route),
            schedule: 'Off-cart',
            dueTime: 'Off-cart',
            givenTime: givenTime,
            highAlert: isHighAlertDrug(drugName),
            prn: false,
            source: source,
            offCart: true,
            reason: reason,
            note: reason
        });
        ['emarOffDrug','emarOffDose','emarOffReason'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const confirmEl = document.getElementById('emarOffRightConfirm');
        if (confirmEl) confirmEl.checked = true;
        renderEmarPage();
        renderDashboardDynamic();
        showToast('บันทึก Off-cart eMAR แล้ว — ' + drugName);
        setTimeout(function(){ showToast(''); }, 2200);
        return false;
    }

    function emarLogRowHtml(record) {
        const offCart = !!record.offCart;
        const label = offCart ? 'Off-cart' : (record.source || 'MAR');
        const ha = record.highAlert ? '<span class="op-tag ha">High Alert</span>' : '';
        return '<div class="emar-log-row' + (offCart ? ' offcart' : '') + '">'
            + '<div><div class="emar-log-title">' + escHtml(record.drugName || '—') + ' ' + ha + '</div>'
            + '<div class="emar-log-meta">' + escHtml(record.patientName || '-') + ' · HN ' + escHtml(record.hn || '-') + ' · เตียง ' + escHtml(record.bed || '-') + '<br>' + escHtml(record.dose || '-') + ' · ' + escHtml(record.route || '-') + ' · ' + escHtml(label) + (record.note ? ' · ' + escHtml(record.note) : '') + '</div></div>'
            + '<div class="emar-log-time">' + escHtml(record.givenTime || record.recordedTime || '-') + '</div>'
            + '</div>';
    }

    function renderEmarDashboardHint() {
        const badge = document.getElementById('dashEmarCount');
        if (!badge || currentRole === 'pharma') return;
        const rows = emarMedicationRows();
        const pending = rows.filter(function(row) { return !row.done; }).length;
        const offCart = getWardEmarRecords(emarWardName()).filter(function(record) { return record.offCart && emarIsToday(record); }).length;
        badge.textContent = pending + ' รอให้ยา' + (offCart ? ' · Off-cart ' + offCart : '');
    }



    function renderEmarPage() {
        const info = getCurrentWardInfo();
        const wardLabel = document.getElementById('emarWardLabel');
        const cartLabel = document.getElementById('emarCartLabel');
        if (wardLabel) wardLabel.textContent = emarWardName();
        if (cartLabel) cartLabel.textContent = info.cart || 'Med Cart A-1';

        const patientSelect = document.getElementById('emarOffPatient');
        const previousPatient = patientSelect ? patientSelect.value : '';
        if (patientSelect) {
            patientSelect.innerHTML = orderPlanPatientOptionsHtml(previousPatient);
            if (previousPatient && patientData[previousPatient]) patientSelect.value = previousPatient;
        }

        const rows = emarMedicationRows();
        const wardRecords = getWardEmarRecords(emarWardName());
        const offCartRecords = wardRecords.filter(function(record) { return record.offCart && emarIsToday(record); });
        const isOffCartFilter = emarCurrentFilter === 'offcart';
        const filtered = isOffCartFilter ? [] : rows.filter(emarFilterMatch);
        const pending = rows.filter(function(row) { return !row.done; }).length;
        const done = rows.filter(function(row) { return row.done; }).length;
        const offCart = offCartRecords.length;
        const stats = {
            total: document.getElementById('emarTotalItems'),
            pending: document.getElementById('emarPendingItems'),
            done: document.getElementById('emarDoneItems'),
            offCart: document.getElementById('emarOffCartItems')
        };
        if (stats.total) stats.total.textContent = rows.length;
        if (stats.pending) stats.pending.textContent = pending;
        if (stats.done) stats.done.textContent = done;
        if (stats.offCart) stats.offCart.textContent = offCart;
        const listBadge = document.getElementById('emarListBadge');
        if (listBadge) listBadge.textContent = filtered.length + ' active';

        const selected = emarSelectedRow(rows);
        const list = document.getElementById('emarScheduledList');
        if (list) {
            if (isOffCartFilter) {
                list.innerHTML = offCartRecords.map(emarLogRowHtml).join('') || '<div class="op-empty">ยังไม่มีรายการ Off-cart วันนี้</div>';
            } else {
                list.innerHTML = filtered.map(emarRowHtml).join('') || '<div class="op-empty">ยังไม่มีรายการใน filter นี้</div>';
            }
        }
        const selectedCard = document.getElementById('emarSelectedCard');
        if (selectedCard) selectedCard.innerHTML = emarSelectedPanelHtml(selected);
        const rightBadge = document.getElementById('emarRightBadge');
        if (rightBadge) {
            rightBadge.textContent = selected && selected.done ? 'บันทึกแล้ว' : selected && selected.highAlert ? 'ต้องมีพยาน' : '7 Rights';
            rightBadge.style.background = selected && selected.highAlert ? '#FEF2F2' : '#F0FDFA';
            rightBadge.style.color = selected && selected.highAlert ? '#DC2626' : '#0F766E';
            rightBadge.style.borderColor = selected && selected.highAlert ? '#FECACA' : '#99F6E4';
        }

        const logBadge = document.getElementById('emarLogBadge');
        if (logBadge) logBadge.textContent = wardRecords.length + ' records';
        const logList = document.getElementById('emarLogList');
        if (logList) {
            logList.innerHTML = wardRecords.slice(0, 12).map(emarLogRowHtml).join('') || '<div class="op-empty">ยังไม่มี eMAR audit record ใน Ward นี้</div>';
        }
        renderEmarDashboardHint();
    }

    function legacyPatientMeta(pt) {
        return [pt.hn, pt.bed].filter(Boolean).join(' · ');
    }

    function legacyAgeText(pt) {
        return (pt.age || '').replace(',', '');
    }

    function legacyWarnTagsHtml(pt, includeHighAlert) {
        const tags = (pt.tags || []).slice();
        if (includeHighAlert && !tags.includes('High Alert Drug')) tags.push('High Alert Drug');
        if (!tags.length && !pt.allergy) return '';
        return tags.map(function(t) {
            const cls = t === 'Fall Risk' ? 'fall' : t.includes('High Alert') ? 'halert' : 'allergy';
            return '<span class="pd-warn-tag ' + cls + '">' + escHtml(t) + '</span>';
        }).join('');
    }

    function legacySummaryGridHtml(entries) {
        return entries.map(function(item) {
            const valueClass = item.className ? ' ' + item.className : '';
            const style = item.style ? ' style="' + item.style + '"' : '';
            const id = item.id ? ' id="' + escHtml(item.id) + '"' : '';
            return '<div><div class="wit-ml">' + escHtml(item.label) + '</div><div class="wit-mv' + valueClass + '"' + id + style + '>' + escHtml(item.value) + '</div></div>';
        }).join('');
    }

    function setLegacyDispensePatient(bedNum) {
        currentLegacyDispenseBed = patientData[bedNum] ? bedNum : '01';
        const pendingIdx = getLegacyDrugs().findIndex(function(d) { return !d.done; });
        currentLegacyDrugIdx = pendingIdx >= 0 ? pendingIdx : 0;
        legacyWitnessVerified = false;
        renderLegacyDispensePages();
    }

    function openDispensePatient(bedNum) {
        setLegacyDispensePatient(bedNum);
        resetScanPt();
        resetWitness();
        nav('pg-pt-detail');
    }

    function renderDispenseList() {
        const list = document.getElementById('ptList');
        if (!list) return;
        const keys = getRoutineDispensePatientKeys();
        list.innerHTML = keys.map(function(key) {
            const pt = patientData[key];
            const drugs = getRoutineDispenseDrugs(pt);
            const pending = drugs.filter(function(d) { return !d.done; }).length;
            const highAlert = drugs.some(isLegacyHighAlertDrug);
            const time = drugs[0] ? legacyRoundTime(pt, drugs[0]) : '—';
            const urgency = pending === 0 ? 'normal' : highAlert ? 'stat' : (key === '03' || key === '02') ? 'soon' : 'normal';
            const statusClass = pending === 0 ? 'waiting' : (key === '03' || key === '02') ? 'soon' : 'waiting';
            const statusText = pending === 0 ? 'จ่ายครบแล้ว' : (key === '03' || key === '02') ? 'ใกล้ถึงเวลา' : 'รอจ่าย';
            const tags = [];
            if (highAlert) tags.push('high-alert');
            if (!tags.length) tags.push('normal');
            const badges = tags.map(function(tag) {
                const label = tag === 'high-alert' ? 'High Alert' : 'ปกติ';
                return '<span class="pt-badge ' + tag + '">' + label + '</span>';
            }).join('');
            return '<div class="pt-card" onclick="openDispensePatient(\'' + escHtml(key) + '\')" data-name="' + escHtml(pt.name) + '" data-hn="' + escHtml(pt.hn) + '" data-bed="' + escHtml(pt.bed) + '" data-status="' + (pending === 0 ? 'done' : statusClass) + '" data-tags="' + tags.join(' ') + '">'
                + '<div class="pt-urgency ' + urgency + '"></div>'
                + '<div class="pt-info">'
                + '<div class="pt-name">' + escHtml(pt.name) + '</div>'
                + '<div class="pt-hn">HN: ' + escHtml(pt.hn) + ' &nbsp;·&nbsp; เตียง ' + escHtml(pt.bed) + '</div>'
                + '<div class="pt-badges">' + badges + '</div>'
                + '</div>'
                + '<div class="pt-meta">'
                + '<div class="pt-time">' + escHtml(time) + '</div>'
                + '<div class="pt-time-label">' + escHtml(pt.round || 'รอบยา') + '</div>'
                + '<span class="pt-status-pill ' + statusClass + '"><span class="dot"></span> ' + statusText + '</span>'
                + '<div class="pt-drugs"><strong>' + (pending || drugs.length) + '</strong>/' + drugs.length + ' รายการยา</div>'
                + '</div>'
                + '<svg class="pt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
                + '</div>';
        }).join('') || '<div style="padding:28px;text-align:center;color:var(--text-3);background:white;border:1px dashed var(--border);border-radius:18px;">ไม่มีรายการจ่ายยาปกติใน Ward นี้ · ตรวจสอบยา PRN ได้ที่เมนูจ่ายยา PRN</div>';

        const strip = document.querySelectorAll('#pg-dispense .disp-strip .ds-chip');
        const info = getCurrentWardInfo();
        if (strip[0]) strip[0].innerHTML = 'รถเข็น: <strong>' + escHtml(info.cart || 'Med Cart A-1') + '</strong>';
        if (strip[2]) strip[2].innerHTML = 'Ward: <strong id="dispWardChip">' + escHtml(wardShortName(currentWardName || DEFAULT_DEMO_WARD)) + '</strong>';
        if (strip[3]) strip[3].innerHTML = 'ผู้ป่วยรอบนี้: <strong>' + keys.length + '</strong> ราย';
        if (strip[4]) {
            const pending = keys.reduce(function(sum, key) {
                return sum + (patientData[key].drugs || []).filter(function(d) { return !d.done; }).length;
            }, 0);
            strip[4].innerHTML = 'ค้าง / รอจ่าย: <strong>' + pending + '</strong> รายการ';
        }
        const allFilterBadge = document.querySelector('#pg-dispense .disp-toolbar .filter-btn.active .filter-badge') || document.querySelector('#pg-dispense .disp-toolbar .filter-btn .filter-badge');
        if (allFilterBadge) allFilterBadge.textContent = keys.length;
        filterPt();
    }

    function renderPatientDetailPage() {
        const pt = getLegacyPatient();
        const drugs = getLegacyDrugs();
        const views = drugs.map(function(d, idx) { return legacyDrugView(d, pt, idx); });
        const pending = views.filter(function(d) { return !d.done; }).length;
        const highAlert = views.some(function(d) { return d.highAlert; });

        const page = document.getElementById('pg-pt-detail');
        if (!page || !pt) return;
        const avatar = page.querySelector('.pd-avatar');
        if (avatar) avatar.textContent = pt.avatar || pt.name.substring(0, 2);
        const nameEl = page.querySelector('.pd-pt-name');
        if (nameEl) nameEl.textContent = pt.name;
        const metaEl = page.querySelector('.pd-pt-meta');
        const ward = getCurrentWardInfo();
        if (metaEl) metaEl.innerHTML = '<span>HN: ' + escHtml(pt.hn) + '</span><span>เตียง ' + escHtml(pt.bed) + '</span><span>' + escHtml(pt.age) + '</span><span>' + escHtml(currentWardName) + ' — ' + escHtml(ward.desc) + '</span>';
        const allergyEl = page.querySelector('.pd-allergy');
        if (allergyEl) {
            allergyEl.style.display = pt.allergy ? 'flex' : 'none';
            if (pt.allergy) allergyEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' + escHtml(pt.allergy);
        }
        const warnEl = page.querySelector('.pd-warnings');
        if (warnEl) {
            const warnHtml = legacyWarnTagsHtml(pt, highAlert);
            warnEl.innerHTML = warnHtml;
            warnEl.style.display = warnHtml ? 'flex' : 'none';
        }
        const schedVals = page.querySelectorAll('.pd-sched-val');
        if (schedVals[0]) schedVals[0].textContent = (views[0] ? views[0].time : '—') + ' น. (' + (pt.round || 'รอบยา').replace('รอบ','') + ')';
        if (schedVals[1]) schedVals[1].textContent = drugs.length + ' รายการ';
        if (schedVals[2]) schedVals[2].textContent = String(views.filter(function(d) { return d.done; }).length);
        if (schedVals[3]) schedVals[3].textContent = String(pending);
        const schedBadges = page.querySelector('.pd-sched-badges');
        if (schedBadges) {
            const normal = views.filter(function(d) { return !d.highAlert && !d.isPrn; }).length;
            const prn = views.filter(function(d) { return d.isPrn; }).length;
            const ha = views.filter(function(d) { return d.highAlert; }).length;
            schedBadges.innerHTML = [
                normal ? '<span class="pt-badge normal" style="font-size:11px;padding:3px 10px;">ปกติ ' + normal + '</span>' : '',
                prn ? '<span class="pt-badge prn" style="font-size:11px;padding:3px 10px;">PRN ' + prn + '</span>' : '',
                ha ? '<span class="pt-badge high-alert" style="font-size:11px;padding:3px 10px;">High Alert ' + ha + '</span>' : ''
            ].join('');
        }

        const drugBox = page.querySelector('.pd-drugs');
        if (drugBox) {
            const head = '<div class="pd-drugs-head"><div class="pd-drugs-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>รายการยา</div><button class="btn-secondary" style="padding:6px 14px;font-size:12px;width:auto;border-radius:8px;" onclick="showToast(\'เลือกหลายรายการจากข้อมูล dynamic แล้ว\'); setTimeout(()=>showToast(\'\'),1500);">เลือกหลายรายการ</button></div>';
            drugBox.innerHTML = head + views.map(function(d) {
                const statusClass = d.done ? 'done' : 'wait';
                const barClass = d.done ? 'done' : 'waiting';
                const badges = (d.isPrn ? '<span class="pt-badge prn">PRN</span>' : '') + (d.highAlert ? '<span class="pt-badge high-alert" style="font-size:9px;padding:2px 7px;">High Alert</span>' : '');
                const warnBadges = d.highAlert ? '<div class="pd-drug-badges"><span class="pt-badge" style="background:#fef2f2;color:#dc2626;font-size:9px;">ต้องมีพยาน</span></div>' : '';
                return '<div class="pd-drug" onclick="selectLegacyDrugFromDetail(' + d.idx + ')" style="cursor:pointer;' + (d.done ? 'opacity:.7;' : '') + '">'
                    + '<div class="pd-drug-left ' + barClass + '"></div>'
                    + '<div class="pd-drug-info"><div class="pd-drug-name">' + escHtml(d.name) + badges + '</div>'
                    + '<div class="pd-drug-detail">' + escHtml(d.routeShort) + ' · ' + escHtml(d.routeFull.replace(/^[A-Z]+\\s*/, '')) + ' &nbsp;·&nbsp; ' + escHtml(d.freq) + '</div>' + warnBadges + '</div>'
                    + '<div class="pd-drug-meta"><div class="pd-drug-time">' + escHtml(d.time) + '</div><div class="pd-drug-route">' + escHtml(d.routeShort) + '</div></div>'
                    + '<span class="pd-drug-status ' + statusClass + '"><span class="dot"></span> ' + escHtml(d.statusText) + '</span>'
                    + '<button class="pd-drug-btn" onclick="event.stopPropagation();selectLegacyDrugFromDetail(' + d.idx + ');showToast(\'เลือก ' + escHtml(d.name) + '\'); setTimeout(()=>showToast(\'\'),1500);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></button>'
                    + '</div>';
            }).join('');
        }
        const startBtn = page.querySelector('.pd-actions .btn-primary');
        if (startBtn) startBtn.onclick = function() { resetScanPt(); nav('pg-scan-pt'); };
    }

    function renderScanPatientPage() {
        const pt = getLegacyPatient();
        const highAlert = getLegacyDrugs().some(isLegacyHighAlertDrug);
        const page = document.getElementById('pg-scan-pt');
        if (!page || !pt) return;
        const avatar = page.querySelector('.spt-avatar');
        if (avatar) avatar.textContent = pt.avatar || pt.name.substring(0, 2);
        const nameEl = page.querySelector('.spt-name');
        if (nameEl) nameEl.textContent = pt.name;
        const metaEl = page.querySelector('.spt-meta');
        if (metaEl) metaEl.textContent = 'HN: ' + pt.hn + ' · ' + legacyAgeText(pt) + ' · ' + currentWardName;
        const warnEl = page.querySelector('.spt-warnings');
        if (warnEl) {
            const warnHtml = legacyWarnTagsHtml(pt, highAlert);
            warnEl.innerHTML = warnHtml;
            warnEl.style.display = warnHtml ? 'flex' : 'none';
        }
        const bedEl = page.querySelector('.spt-bed');
        if (bedEl) bedEl.textContent = pt.bed;
        const detail = document.getElementById('sptResultDetail');
        if (detail) detail.textContent = pt.name + ' · HN: ' + pt.hn + ' · เตียง ' + pt.bed;
    }

    function selectLegacyDrugFromDetail(idx) {
        currentLegacyDrugIdx = idx;
        legacyWitnessVerified = false;
        renderAdminMedPage(true);
        nav('pg-admin-med');
    }

    function renderAdminMedPage(keepResult) {
        const pt = getLegacyPatient();
        const drugs = getLegacyDrugs();
        const page = document.getElementById('pg-admin-med');
        if (!page || !pt) return;
        const currentDrug = drugs[currentLegacyDrugIdx] || drugs[0];
        const currentView = legacyDrugView(currentDrug || {}, pt, currentLegacyDrugIdx);

        const nameEl = page.querySelector('.am-ptbar-name');
        if (nameEl) nameEl.textContent = pt.name;
        const metaEl = page.querySelector('.am-ptbar-meta');
        if (metaEl) metaEl.innerHTML = '<span>HN: ' + escHtml(pt.hn) + '</span><span>เตียง ' + escHtml(pt.bed) + '</span><span>' + escHtml(legacyAgeText(pt)) + '</span>';
        const warnEl = page.querySelector('.am-ptbar-warn');
        if (warnEl) {
            warnEl.style.display = pt.allergy ? '' : 'none';
            if (pt.allergy) warnEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' + escHtml(pt.allergy);
        }
        const timeEl = page.querySelector('.am-ptbar-time');
        if (timeEl) timeEl.textContent = 'รอบ ' + (currentView.time === 'PRN' ? 'PRN' : currentView.time + ' น.');
        const head = page.querySelector('.am-col-head');
        if (head) head.lastChild.textContent = ' รายการยา (' + drugs.length + ')';

        const list = page.querySelector('.am-col-scroll');
        if (list) {
            list.innerHTML = drugs.map(function(drug, idx) {
                const d = legacyDrugView(drug, pt, idx);
                const active = idx === currentLegacyDrugIdx ? ' active' : '';
                const disabled = d.done ? ' done' : '';
                const badges = (d.isPrn ? '<span class="pt-badge prn" style="font-size:9px;padding:1px 6px;">PRN</span>' : '') + (d.highAlert ? '<span class="pt-badge high-alert" style="font-size:8px;padding:1px 5px;">High Alert</span>' : '');
                return '<div class="am-drug' + active + disabled + '" data-index="' + idx + '" onclick="selectAmDrugByIndex(' + idx + ')" style="' + (d.done ? 'opacity:.6;' : '') + '">'
                    + '<div class="am-drug-name">' + escHtml(d.name) + ' ' + badges + '</div>'
                    + '<div class="am-drug-sub">' + escHtml(d.routeShort) + ' · ' + escHtml(d.time) + '</div>'
                    + '<div class="am-drug-tags"><span class="am-drug-st ' + (d.done ? 'done' : idx === currentLegacyDrugIdx ? 'ready' : 'wait') + '">' + (d.done ? 'ให้แล้ว' : idx === currentLegacyDrugIdx ? 'พร้อมสแกน' : 'ยังไม่สแกน') + '</span></div>'
                    + '</div>';
            }).join('');
        }
        renderLegacyAdminDrugDetail();
        if (!keepResult) {
            const scanResult = document.getElementById('amScanResult');
            if (scanResult) scanResult.classList.remove('show');
            const confirmBtn = document.getElementById('btnConfirmAdmin');
            if (confirmBtn) confirmBtn.disabled = true;
        }
        const confirmBtn = document.getElementById('btnConfirmAdmin');
        if (confirmBtn) confirmBtn.onclick = function() { legacyAdminConfirm(); };
        renderLegacySummaryPages();
    }

    function renderLegacyAdminDrugDetail() {
        const pt = getLegacyPatient();
        const d = legacyDrugView(getLegacyDrug(), pt, currentLegacyDrugIdx);
        const nameEl = document.querySelector('#pg-admin-med .am-detail-name');
        if (nameEl) {
            const badges = (d.isPrn ? '<span class="pt-badge prn" style="font-size:10px;padding:2px 8px;">PRN</span>' : '') + (d.highAlert ? '<span class="pt-badge high-alert" style="font-size:9px;padding:2px 7px;">High Alert</span>' : '');
            nameEl.innerHTML = escHtml(d.name) + ' ' + badges;
        }
        const grid = document.querySelector('#pg-admin-med .am-detail-grid');
        if (grid) {
            grid.innerHTML = '<div><div class="am-dl">ชื่อยาเต็ม</div><div class="am-dv">' + escHtml(d.name) + '</div></div>'
                + '<div><div class="am-dl">รูปแบบ</div><div class="am-dv">' + escHtml(d.routeShort === 'PO' ? 'ยาเม็ด / แคปซูล' : 'ยาฉีด') + '</div></div>'
                + '<div><div class="am-dl">Dose สั่ง</div><div class="am-dv green">' + escHtml(d.dose) + '</div></div>'
                + '<div><div class="am-dl">Route</div><div class="am-dv">' + escHtml(d.routeFull) + '</div></div>'
                + '<div><div class="am-dl">เวลาให้ยา</div><div class="am-dv">' + escHtml(d.time === 'PRN' ? 'PRN' : d.time + ' น.') + '</div></div>'
                + '<div><div class="am-dl">Frequency</div><div class="am-dv">' + escHtml(d.freq) + '</div></div>';
        }
        const warnBox = document.querySelector('#pg-admin-med .am-warn-box');
        if (warnBox) {
            warnBox.style.display = d.highAlert ? 'flex' : 'none';
            if (d.highAlert) warnBox.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div><strong>ต้องมีพยาน (Witness required)</strong><br>ยานี้จัดเป็น High Alert Drug — ต้องมีพยาบาลอีก 1 คนร่วมตรวจสอบก่อนให้ยา</div>';
        }
        const srName = document.querySelector('#pg-admin-med .am-sr-name');
        if (srName) srName.textContent = d.name;
        const srGrid = document.querySelector('#pg-admin-med .am-sr-grid');
        if (srGrid) {
            srGrid.innerHTML = '<div><div class="am-sr-l">Barcode</div><div class="am-sr-v">DYN-' + escHtml(String(currentLegacyDrugIdx + 1).padStart(3, '0')) + '</div></div>'
                + '<div><div class="am-sr-l">จำนวน</div><div class="am-sr-v">' + escHtml(d.dose) + '</div></div>'
                + '<div><div class="am-sr-l">Lot</div><div class="am-sr-v">' + escHtml(d.lot) + '</div></div>'
                + '<div><div class="am-sr-l">Expiry</div><div class="am-sr-v">' + escHtml(d.exp) + '</div></div>';
        }
    }

    function selectAmDrugByIndex(idx) {
        const drug = getLegacyDrug(idx);
        if (!drug || drug.done) return;
        currentLegacyDrugIdx = idx;
        legacyWitnessVerified = false;
        document.querySelectorAll('.am-drug').forEach(function(d) { d.classList.remove('active'); });
        const active = document.querySelector('.am-drug[data-index="' + idx + '"]');
        if (active) active.classList.add('active');
        ['rDrug','rDose','rRoute'].forEach(function(id) {
            const r = document.getElementById(id);
            if (r) r.className = 'am-r pend';
        });
        const scanResult = document.getElementById('amScanResult');
        if (scanResult) scanResult.classList.remove('show');
        const confirmBtn = document.getElementById('btnConfirmAdmin');
        if (confirmBtn) confirmBtn.disabled = true;
        renderLegacyAdminDrugDetail();
        renderLegacySummaryPages();
    }

    function completeLegacyScanMed() {
        const d = legacyDrugView(getLegacyDrug(), getLegacyPatient(), currentLegacyDrugIdx);
        renderLegacyAdminDrugDetail();
        document.getElementById('amScanResult').classList.add('show');
        const rights = ['rDrug','rDose','rRoute'];
        rights.forEach(function(id, i) {
            setTimeout(function() {
                const el = document.getElementById(id);
                if (el) el.className = 'am-r pass';
            }, i * 80);
        });
        setTimeout(function() {
            document.getElementById('btnConfirmAdmin').disabled = false;
        }, rights.length * 80);
        showToast('สแกน ' + d.name + ' สำเร็จ — 7 Rights ผ่านทั้งหมด');
        setTimeout(function(){ showToast(''); }, 2000);
    }

    function legacyAdminConfirm(force) {
        const d = legacyDrugView(getLegacyDrug(), getLegacyPatient(), currentLegacyDrugIdx);
        if (d.highAlert && !legacyWitnessVerified && !force) {
            showToast('ต้องสแกนพยานก่อนยืนยันยา High Alert');
            setTimeout(function(){ showToast(''); }, 2200);
            renderLegacySummaryPages();
            nav('pg-witness');
            return;
        }
        legacyLastGivenTime = new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) + ' น.';
        renderLegacySummaryPages();
        nav('pg-record');
    }

    function renderLegacySummaryPages() {
        const pt = getLegacyPatient();
        const d = legacyDrugView(getLegacyDrug(), pt, currentLegacyDrugIdx);
        const commonEntries = [
            { label:'ผู้ป่วย', value: pt.name },
            { label:'HN / เตียง', value: legacyPatientMeta(pt) },
            { label:'ชื่อยา', value: d.name, className:'green' },
            { label:'Route / Dose', value: d.routeShort + ' · ' + d.dose },
            { label:'เวลาเดิม', value: d.time === 'PRN' ? 'PRN' : d.time + ' น.' },
            { label:'ประเภท', value: d.typeText, style: d.highAlert ? 'color:#dc2626;' : '' }
        ];
        const witnessGrid = document.querySelector('#pg-witness .wit-med-grid');
        if (witnessGrid) witnessGrid.innerHTML = legacySummaryGridHtml([
            { label:'ผู้ป่วย', value: pt.name },
            { label:'HN / เตียง', value: legacyPatientMeta(pt) },
            { label:'ชื่อยา', value: d.name, className:'green' },
            { label:'Route', value: d.routeFull },
            { label:'Dose', value: d.dose, className:'green' },
            { label:'เวลาให้', value: d.time === 'PRN' ? 'PRN' : d.time + ' น.' }
        ]);
        const omitGrid = document.querySelector('#pg-omit .omit-med-grid');
        if (omitGrid) omitGrid.innerHTML = legacySummaryGridHtml(commonEntries);
        const recGrid = document.querySelector('#pg-record .rec-grid');
        if (recGrid) recGrid.innerHTML = legacySummaryGridHtml([
            { label:'ผู้ป่วย', value: pt.name },
            { label:'HN / เตียง', value: legacyPatientMeta(pt) },
            { label:'ชื่อยา', value: d.name, className:'green' },
            { label:'Dose', value: d.dose },
            { label:'Route', value: d.routeFull },
            { label:'สถานะ', value: 'ให้ยาแล้ว', className:'green' },
            { label:'ผู้ให้ยา', value: 'นส.สมใจ ดีมาก (EMP-4821)' },
            { label:'พยาน', value: d.highAlert ? (legacyWitnessVerified ? 'นส.วรรณา รุ่งเรือง (EMP-3251)' : 'รอสแกนพยาน') : 'ไม่จำเป็น' }
        ]);
        const okGrid = document.querySelector('#pg-success .ok-summary-grid');
        if (okGrid) okGrid.innerHTML = legacySummaryGridHtml([
            { label:'ผู้ป่วย', value: pt.name },
            { label:'HN / เตียง', value: legacyPatientMeta(pt) },
            { label:'ชื่อยา', value: d.name, className:'green' },
            { label:'สถานะ', value: 'ให้ยาแล้ว', className:'green' },
            { label:'เวลาให้จริง', value: legacyLastGivenTime },
            { label:'ผู้บันทึก', value: 'นส.สมใจ ดีมาก' },
            { label:'พยาน', value: d.highAlert ? (legacyWitnessVerified ? 'นส.วรรณา รุ่งเรือง' : 'รอสแกนพยาน') : 'ไม่จำเป็น' },
            { label:'บันทึกเมื่อ', value: document.getElementById('okTimestamp')?.textContent || '--', id:'okTimestamp' }
        ]);
        const witAction = document.querySelector('#witActions .btn-primary');
        if (witAction) witAction.onclick = function() { legacyAdminConfirm(true); };
    }

    function renderLegacyDispensePages() {
        renderPatientDetailPage();
        renderScanPatientPage();
        renderAdminMedPage(false);
        renderLegacySummaryPages();
    }

    function getDashboardMetrics() {
        const info = getCurrentWardInfo();
        const keys = getDispensePatientKeys();
        const drugs = keys.flatMap(function(key) { return patientData[key].drugs || []; });
        const total = drugs.length;
        const done = drugs.filter(function(d) { return d.done; }).length;
        const pending = Math.max(total - done, 0);
        const highAlert = drugs.filter(isLegacyHighAlertDrug).length;
        const prn = drugs.filter(function(d) { return /prn/i.test(d.desc || ''); }).length;
        const percent = total ? Math.round((done / total) * 100) : 0;
        const wardPatients = parseInt(String(info.patients || '').replace(/[^\d]/g, ''), 10);
        return {
            patients: Number.isFinite(wardPatients) ? wardPatients : keys.length,
            loadedPatients: keys.length,
            total: total,
            done: done,
            pending: pending,
            highAlert: highAlert,
            prn: prn,
            percent: percent
        };
    }

    function getCurrentDashboardCart() {
        const info = getCurrentWardInfo();
        const cartName = info.cart || 'Med Cart A-1';
        const cartId = cartName.replace(/^Med Cart\s+/,'');
        let list = [];
        try { list = cartList || []; } catch (e) { list = []; }
        const foundByCart = list.find(function(c) {
            return c.name === cartName || c.id === cartId;
        });
        if (foundByCart) return foundByCart;
        const foundByWard = !info.cart ? list.find(function(c) {
            return c.ward === currentWardName;
        }) : null;
        if (foundByWard) return foundByWard;
        const isCritical = /ICU|ER/i.test(currentWardName || cartId);
        const series = (cartId.match(/^[A-Z]+/i) || ['A'])[0].toUpperCase();
        const drawerSpecBySeries = {
            A: { drawers: STANDARD_CART_DRAWERS, cassettes: STANDARD_CART_CASSETTES, ready: STANDARD_CART_CASSETTES, model: 'OmniRx Pro X2' },
            B: { drawers: STANDARD_CART_DRAWERS, cassettes: STANDARD_CART_CASSETTES, ready: STANDARD_CART_CASSETTES, model: 'OmniRx Lite' },
            C: { drawers: STANDARD_CART_DRAWERS, cassettes: STANDARD_CART_CASSETTES, ready: STANDARD_CART_CASSETTES, model: 'OmniRx Pro X3' },
            D: { drawers: STANDARD_CART_DRAWERS, cassettes: STANDARD_CART_CASSETTES, ready: STANDARD_CART_CASSETTES, model: 'OmniRx Lite' }
        };
        const spec = isCritical
            ? { drawers: STANDARD_CART_DRAWERS, cassettes: STANDARD_CART_CASSETTES, ready: STANDARD_CART_CASSETTES, model: 'OmniRx Pro X3' }
            : (drawerSpecBySeries[series] || drawerSpecBySeries.A);
        const isMaintenance = /B-2|D-2/i.test(cartId);
        const ready = Math.min(spec.ready, spec.cassettes);
        return {
            id: cartId,
            name: cartName,
            code: 'MC-' + cartId.replace(/[^A-Z0-9]/gi,'').toUpperCase(),
            model: spec.model,
            ward: currentWardName || DEFAULT_DEMO_WARD,
            wardNote: info.desc,
            status: isMaintenance ? 'maintenance' : 'ready',
            statusText: isMaintenance ? 'อยู่ระหว่างซ่อมบำรุง' : 'พร้อมใช้งาน',
            statusClass: isMaintenance ? 'maintenance' : 'online',
            battery: isMaintenance ? 35 : (isCritical ? 95 : series === 'B' ? 100 : 85),
            battNote: isMaintenance ? 'แบตเตอรี่ต่ำ' : isCritical ? 'กำลังชาร์จ' : 'ใช้งานปกติ',
            drawers: spec.drawers,
            cassettes: spec.cassettes,
            cassettesReady: ready,
            connection: isMaintenance ? 'Offline' : 'Wi-Fi',
            signal: isMaintenance ? 'ไม่มีสัญญาณ' : 'สัญญาณแรง'
        };
    }

    function dashCassetteCountForDrawer(drawerNo, drawerTotal, cassetteTotal) {
        drawerTotal = Math.max(1, Math.floor(drawerTotal) || 1);
        cassetteTotal = Math.max(0, Math.floor(cassetteTotal) || 0);
        const base = Math.floor(cassetteTotal / drawerTotal);
        const extra = cassetteTotal % drawerTotal;
        return base + (drawerNo <= extra ? 1 : 0);
    }
    function dashCassetteGlobalIndex(drawerNo, cassetteNo, drawerTotal, cassetteTotal) {
        let idx = 0;
        for (let d = 1; d < drawerNo; d++) idx += dashCassetteCountForDrawer(d, drawerTotal, cassetteTotal);
        return idx + cassetteNo;
    }

    function getDashboardCassetteState() {
        const cart = getCurrentDashboardCart();
        /* Override capacity from backoffice sessionStorage if present */
        var boCapOverride = {};
        try {
            var boCapAll = JSON.parse(sessionStorage.getItem('boCartCapacity') || '{}');
            var capKey = (cart.code || '').replace(/^MC-/i, '') || cart.id;
            boCapOverride = boCapAll[capKey] || boCapAll[cart.id] || {};
        } catch (e) {}
        const drawers = Math.max(parseInt(boCapOverride.drawers || cart.drawers, 10) || 6, 1);
        const total = Math.max(parseInt(boCapOverride.cassettes || cart.cassettes, 10) || drawers * STANDARD_CART_CASSETTES_PER_DRAWER, drawers);
        const readyBase = Math.max(Math.min(parseInt(boCapOverride.cassettesEnabled || cart.cassettesReady || total, 10), total), 0);
        const perDrawer = Math.max(Math.ceil(total / drawers), 1);
        const locks = Object.values(cassetteModeLocks).filter(function(lock) {
            return !lock.ward || lock.ward === (currentWardName || DEFAULT_DEMO_WARD);
        });
        const validLocks = locks.filter(function(lock) {
            const drawer = parseInt(lock.drawer, 10) || 0;
            const cassette = parseInt(lock.cassette, 10) || 0;
            if (drawer < 1 || drawer > drawers || cassette < 1) return false;
            if (cassette > dashCassetteCountForDrawer(drawer, drawers, total)) return false;
            const index = dashCassetteGlobalIndex(drawer, cassette, drawers, total);
            return index >= 1 && index <= total;
        });
        const completedLocks = Object.values(cassetteModeCompleted).filter(function(lock) {
            if (lock.ward && lock.ward !== (currentWardName || DEFAULT_DEMO_WARD)) return false;
            const drawer = parseInt(lock.drawer, 10) || 0;
            const cassette = parseInt(lock.cassette, 10) || 0;
            if (drawer < 1 || drawer > drawers || cassette < 1) return false;
            if (cassette > dashCassetteCountForDrawer(drawer, drawers, total)) return false;
            const index = dashCassetteGlobalIndex(drawer, cassette, drawers, total);
            return index >= 1 && index <= total;
        });
        const usedByKey = {};
        validLocks.concat(completedLocks).forEach(function(lock) {
            const drawer = parseInt(lock.drawer, 10) || 0;
            const cassette = parseInt(lock.cassette, 10) || 0;
            if (!drawer || !cassette) return;
            usedByKey[ptdCassetteKey(drawer, cassette)] = lock;
        });
        const usedLocks = Object.values(usedByKey);
        const usedDrawerMap = {};
        usedLocks.forEach(function(lock) {
            const drawer = parseInt(lock.drawer, 10) || 0;
            if (drawer) usedDrawerMap[drawer] = true;
        });
        const usedCassettes = usedLocks.length;
        const usedDrawers = Object.keys(usedDrawerMap).length;
        const byMode = { patient:0, medication:0, schedule:0 };
        validLocks.forEach(function(lock) {
            if (byMode[lock.mode] !== undefined) byMode[lock.mode]++;
        });
        // Only count completed (actually prepped) cassettes — not just locked/selected
        var preppedFromStore = 0;
        if (typeof MedCartStore !== 'undefined') {
            preppedFromStore = MedCartStore.orders.filter(function(o){ return o.status === 'prepped'; }).length;
        }
        var actualCompleted = completedLocks.length + preppedFromStore;
        /* Read manually-closed slots from backoffice sessionStorage */
        var disabledSlots = new Set();
        try {
            var boDisabled = JSON.parse(sessionStorage.getItem('boCartDisabledSlots') || '{}');
            // Try matching by code (e.g. "A-1"), then by id, then by name-derived key
            var codeKey = (cart.code || '').replace(/^MC-/i, '') || cart.id || cart.name.replace(/^Med Cart\s+/, '');
            var slotArr = boDisabled[codeKey] || boDisabled[cart.id] || [];
            slotArr.forEach(function(k) { disabledSlots.add(k); });
        } catch (e) { }

        return {
            cart: cart,
            drawers: drawers,
            total: total,
            readyBase: readyBase,
            perDrawer: perDrawer,
            maintenance: Math.max(total - readyBase, 0),
            inUse: actualCompleted,
            usedDrawers: usedDrawers,
            usedCassettes: Math.min(completedLocks.length + preppedFromStore, total),
            usedLocks: usedLocks,
            completed: actualCompleted,
            available: Math.max(readyBase - actualCompleted, 0),
            locks: validLocks,
            completedLocks: completedLocks,
            byMode: byMode,
            disabledSlots: disabledSlots
        };
    }

    function renderDashboardCassetteUsageCard(state) {
        state = state || getDashboardCassetteState();
        const statCassette = document.getElementById('dashStatCassette');
        const statCassetteSub = document.getElementById('dashStatCassetteSub');
        const usedDrawers = Math.min(state.usedDrawers || 0, state.drawers || 0);
        const usedCassettes = Math.min(state.usedCassettes || 0, state.total || 0);
        if (statCassette) {
            statCassette.innerHTML = usedDrawers
                + '<span style="font-size:15px;color:#94a3b8;font-weight:500;">/' + state.drawers + '</span>';
        }
        if (statCassetteSub) {
            statCassetteSub.textContent = 'Cassette ' + usedCassettes + '/' + state.total + ' ใช้งานอยู่';
        }
    }

    function renderDashboardCartCard(state) {
        state = state || getDashboardCassetteState();
        const cart = state.cart || {};
        const cartChipId = document.querySelector('#dashBanner .db-cart-chip-id');
        const cartName = document.getElementById('dashCartName');
        const cartStatus = document.getElementById('dashCartStatus');
        const statusText = cart.connection === 'Offline'
            ? 'Offline'
            : (cart.statusClass === 'maintenance' ? 'Maintenance' : 'Online');
        if (cartChipId) cartChipId.textContent = cart.id || (cart.name || 'Med Cart A-1').replace(/^Med Cart\s+/,'');
        if (cartName) cartName.textContent = cart.name || 'Med Cart A-1';
        if (cartStatus) {
            cartStatus.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>'
                + (cart.battery || 0) + '% · ' + statusText;
            cartStatus.style.color = cart.connection === 'Offline' ? '#fecaca' : '';
        }
    }

    function renderDashboardCassettePanel() {
        const panel = document.getElementById('dashCassettePanel');
        if (!panel) return;
        const state = getDashboardCassetteState();
        const cart = state.cart;
        renderDashboardCartCard(state);
        renderDashboardCassetteUsageCard(state);
        const sub = document.getElementById('dashCassetteSub');
        if (sub) sub.textContent = cart.name + ' · ' + (currentWardName || cart.ward) + ' · ' + (cart.statusText || 'พร้อมใช้งาน');
        const mapSub = document.getElementById('dashCassetteMapSub');
        const _baseCPD = Math.floor(state.total / state.drawers);
        const _extraCPD = state.total % state.drawers;
        const _cpd = _extraCPD > 0 ? (_baseCPD + 1) + '–' + _baseCPD : String(_baseCPD);
        if (mapSub) mapSub.textContent = state.drawers + ' Drawer · ' + _cpd + ' Cassette ต่อ Drawer · ' + state.total + ' ช่องทั้งหมด';
        const pill = document.getElementById('dashCassetteModePill');
        if (pill) {
            const modeText = state.inUse
                ? state.inUse + ' ช่องเติมยาเรียบร้อยแล้ว'
                : 'พร้อมใช้ทุก Role';
            pill.innerHTML = '<span style="width:7px;height:7px;background:' + (state.inUse ? '#3b82f6' : '#22c55e') + ';border-radius:50%;box-shadow:0 0 0 3px ' + (state.inUse ? 'rgba(59,130,246,.16)' : 'rgba(34,197,94,.16)') + ';"></span>' + modeText;
        }

        var inProgressCount = state.locks.length;
        const statData = [
            { val: state.total, label: 'Cassette ทั้งหมด', note: state.drawers + ' Drawer', color: '#0f172a', accent: '#64748b', bg: '#f8fafc' },
            { val: state.completed, label: 'เติมยาแล้ว', note: 'จัดยาครบแล้ว', color: '#1d4ed8', accent: '#3b82f6', bg: '#eff6ff' },
            { val: inProgressCount, label: 'กำลังจัด', note: 'เลือกแล้ว · รอจัดยา', color: '#b45309', accent: '#f59e0b', bg: '#fffbeb' },
            { val: state.available, label: 'ว่าง', note: 'รอจัดยา', color: '#15803d', accent: '#22c55e', bg: '#f0fdf4' }
        ];
        const summary = document.getElementById('dashCassetteSummary');
        if (summary) {
            summary.innerHTML = statData.map(function(item) {
                return '<div class="db-cassette-stat" style="background:' + item.bg + ';--accent:' + item.accent + ';">'
                    + '<div class="db-cassette-stat-val" style="color:' + item.color + ';">' + item.val + '</div>'
                    + '<div class="db-cassette-stat-label">' + item.label + '</div>'
                    + '<div class="db-cassette-stat-note">' + escHtml(item.note) + '</div>'
                    + '</div>';
            }).join('');
        }

        // Show both in-progress (locked) and completed cassettes — visually distinct
        const lockByKey = {};
        state.locks.forEach(function(lock) {
            lockByKey[ptdCassetteKey(lock.drawer, lock.cassette)] = Object.assign({}, lock, { __completed: false });
        });
        state.completedLocks.forEach(function(lock) {
            lockByKey[ptdCassetteKey(lock.drawer, lock.cassette)] = Object.assign({}, lock, { __completed: true });
        });
        const map = document.getElementById('dashCassetteMap');
        if (map) {
            let html = '';
            const disabledSlots = state.disabledSlots || new Set();
            for (let d = 1; d <= state.drawers; d++) {
                let cells = '';
                const cassPD = dashCassetteCountForDrawer(d, state.drawers, state.total);
                for (let c = 1; c <= cassPD; c++) {
                    const globalIndex = dashCassetteGlobalIndex(d, c, state.drawers, state.total);
                    const slotKey = d + ':' + c;
                    const isManuallyClosed = disabledSlots.has(slotKey);
                    const lock = !isManuallyClosed ? lockByKey[ptdCassetteKey(d, c)] : null;
                    const cfg = lock ? cassetteModeConfig[lock.mode] : null;
                    const isMaintenance = !lock && !isManuallyClosed && globalIndex > state.readyBase;
                    const cls = isManuallyClosed ? 'closed' : lock ? lock.mode : isMaintenance ? 'maintenance' : '';
                    const statusText = isManuallyClosed ? 'ปิดใช้งาน (กำหนดจาก Backoffice)' : lock && lock.__completed ? 'เติมยาเรียบร้อยแล้ว' : lock ? 'กำลังจัดยา (' + (cfg ? cfg.label : lock.mode) + ')' : isMaintenance ? 'ไม่พร้อมใช้' : 'ว่าง · รอจัดยา';
                    const title = 'Drawer ' + d + ' · Cassette ' + c + ' · ' + statusText;
                    const cellOnclick = isManuallyClosed ? '' : ' onclick="event.stopPropagation();showCassetteDetailModal(' + d + ',' + c + ')"';
                    const cellStyle = isManuallyClosed ? ' style="cursor:not-allowed;pointer-events:none;background:#FEE2E2;border:1.5px solid #FCA5A5;"' : '';
                    const cellInner = isManuallyClosed ? '<span style="color:#DC2626;font-size:9px;font-weight:900;line-height:1;">✕</span>' : '';
                    cells += '<button type="button" class="db-cassette-cell ' + cls + (lock && lock.__completed ? ' completed' : '') + '" title="' + escHtml(title) + '" aria-label="' + escHtml(title) + '"' + cellStyle + cellOnclick + '>' + cellInner + '</button>';
                }
                const drawerOffset = dashCassetteGlobalIndex(d, 1, state.drawers, state.total) - 1;
                const readyInDrawer = Math.max(Math.min(state.readyBase - drawerOffset, cassPD), 0);
                const locksInDrawer = state.locks.filter(function(l){ return parseInt(l.drawer) === d; });
                const completedInDrawer = state.completedLocks.filter(function(l){ return parseInt(l.drawer) === d; });
                const allInDrawer = locksInDrawer.length + completedInDrawer.length;
                const drawerBadge = allInDrawer > 0
                    ? '<span style="background:#ccfbf1;color:#0D9488;font-size:9px;font-weight:800;padding:2px 7px;border-radius:5px;border:1px solid #99F6E4;">' + allInDrawer + ' รายการ</span>'
                    : '<span style="background:#f1f5f9;color:#94a3b8;font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;">' + readyInDrawer + '/' + state.perDrawer + '</span>';
                html += '<div class="db-cassette-drawer" onclick="showDrawerDetailModal(' + d + ')" style="cursor:pointer;transition:box-shadow .16s,transform .16s;" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(13,148,136,0.15)\';this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'">'
                    + '<div class="db-cassette-drawer-head"><span>D' + d + '</span>' + drawerBadge + '</div>'
                    + '<div class="db-cassette-drawer-grid">' + cells + '</div>'
                    + '</div>';
            }
            map.innerHTML = html;
        }

    }

    function closeDashboardDetailModals() {
        ['cassetteDetailModal', 'drawerDetailModal'].forEach(function(id) {
            const modal = document.getElementById(id);
            if (modal) modal.style.display = 'none';
        });
    }

    function getPreparedCassetteItemsFromPatientData(drawerNum, cassNum) {
        const items = [];
        Object.keys(patientData || {}).forEach(function(key) {
            const pt = patientData[key];
            if (!pt || !pt.drugs) return;
            pt.drugs.forEach(function(drug, idx) {
                const preparedHere = String(drug.preparedDrawer || '') === String(drawerNum)
                    && String(drug.preparedCassette || '') === String(cassNum);
                if (!preparedHere) return;
                const item = cassetteItemFromPatientDrug(pt, key, drug, idx, {
                    done: true,
                    status: 'จัดแล้ว',
                    round: prepRoundFromView(legacyDrugView(drug, pt, idx), pt),
                    slot: drug.preparedSlot || '',
                    preparedTime: drug.preparedTime || ''
                });
                if (item) items.push(item);
            });
        });
        return items;
    }

    function getDashboardCassetteItems(detail) {
        if (!detail) return [];
        // Not completed — show items with actual status from patientData (prepared or not)
        if (!detail.isCompleted) {
            if (detail.isActive) {
                var fromLockPending = detail.lock && Array.isArray(detail.lock.cassetteItems)
                    ? detail.lock.cassetteItems.map(normalizeCassetteItem).filter(Boolean)
                    : [];
                var fromDataPending = getPreparedCassetteItemsFromPatientData(detail.drawer, detail.cassette);
                var mergedPending = mergeCassetteItems(fromLockPending, fromDataPending);
                if (mergedPending.length) return mergedPending;
                return getLockDrugNames(detail.lock).map(function(name) {
                    return normalizeCassetteItem({ drugName: name, status: 'รอจัด', done: false });
                }).filter(Boolean);
            }
            return [];
        }
        const fromLock = detail.lock && Array.isArray(detail.lock.cassetteItems)
            ? detail.lock.cassetteItems.map(normalizeCassetteItem).filter(Boolean)
            : [];
        const fromData = getPreparedCassetteItemsFromPatientData(detail.drawer, detail.cassette);
        const merged = mergeCassetteItems(fromLock, fromData);
        if (merged.length) return merged;
        return getLockDrugNames(detail.lock).map(function(name) {
            return normalizeCassetteItem({ drugName: name, status: 'จัดแล้ว', done: true });
        }).filter(Boolean);
    }

    function getDashboardCassetteDetail(drawerNum, cassNum) {
        const state = getDashboardCassetteState();
        const key = ptdCassetteKey(drawerNum, cassNum);
        const completed = state.completedLocks.find(function(lock) {
            return ptdCassetteKey(lock.drawer, lock.cassette) === key;
        }) || null;
        const active = state.locks.find(function(lock) {
            return ptdCassetteKey(lock.drawer, lock.cassette) === key;
        }) || null;
        const lock = active || completed || null;
        const globalIndex = dashCassetteGlobalIndex(drawerNum, cassNum, state.drawers, state.total);
        const isManuallyClosed = (state.disabledSlots || new Set()).has(drawerNum + ':' + cassNum);
        const isMaintenance = !lock && !isManuallyClosed && globalIndex > state.readyBase;
        const cfg = lock ? cassetteModeConfig[lock.mode] : null;
        const detail = {
            state: state,
            cart: state.cart || {},
            drawer: drawerNum,
            cassette: cassNum,
            key: key,
            globalIndex: globalIndex,
            active: active,
            completed: completed,
            lock: lock,
            cfg: cfg,
            drugs: getLockDrugNames(lock),
            isCompleted: !!completed,
            isActive: !!active,
            isMaintenance: isMaintenance,
            isManuallyClosed: isManuallyClosed,
            isReady: !lock && !isMaintenance && !isManuallyClosed
        };
        detail.items = getDashboardCassetteItems(detail);
        detail.drugs = cassetteDrugNamesFromItems(detail.items).length ? cassetteDrugNamesFromItems(detail.items) : detail.drugs;
        return detail;
    }

    function formatCassetteDetailTime(iso) {
        if (!iso) return '-';
        try {
            return new Date(iso).toLocaleString('th-TH', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
        } catch (e) {
            return '-';
        }
    }

    function cassetteDetailInfoRow(label, value) {
        return '<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #F1F5F9;">'
            + '<span style="font-size:12px;color:#64748b;font-weight:700;">' + escHtml(label) + '</span>'
            + '<span style="font-size:12px;color:#0f172a;font-weight:800;text-align:right;">' + escHtml(value || '-') + '</span>'
            + '</div>';
    }

    function showCassetteDetailModal(drawerNum, cassNum) {
        const detail = getDashboardCassetteDetail(drawerNum, cassNum);
        if (detail.globalIndex > detail.state.total) return;
        const cfg = detail.cfg;
        const modeTheme = {
            patient:    { color:'#0D9488', bg:'#CCFBF1', border:'#5EEAD4', label:'By Patient' },
            medication: { color:'#2563EB', bg:'#DBEAFE', border:'#93C5FD', label:'By Item' },
            schedule:   { color:'#7C3AED', bg:'#EDE9FE', border:'#C4B5FD', label:'By Round' },
            prn:        { color:'#BE185D', bg:'#FCE7F3', border:'#FBCFE8', label:'PRN Stock' },
            ready:      { color:'#15803D', bg:'#DCFCE7', border:'#BBF7D0', label:'พร้อมใช้' },
            completed:  { color:'#1D4ED8', bg:'#DBEAFE', border:'#93C5FD', label:'เติมยาเรียบร้อยแล้ว' },
            maintenance:{ color:'#DC2626', bg:'#FEE2E2', border:'#FECACA', label:'ไม่พร้อมใช้' }
        };
        const modeKey = detail.isMaintenance ? 'maintenance' : detail.lock ? detail.lock.mode : 'ready';
        const th = (modeKey === 'prn') ? modeTheme.prn : (detail.isCompleted ? modeTheme.completed : (modeTheme[modeKey] || modeTheme.ready));
        const statusLabel = detail.isMaintenance
            ? 'ไม่พร้อมใช้'
            : detail.isCompleted
                ? 'เติมยาเรียบร้อยแล้ว'
                : detail.lock
                    ? 'รอจัดยา'
                    : 'ว่าง';
        const modeLabel = cfg ? (cfg.dashboardLabel + ' · ' + cfg.label) : (detail.isMaintenance ? 'งดใช้งานชั่วคราว' : 'ยังไม่ถูกจอง');
        const isMedMode = modeKey === 'medication';
        const drugList = detail.items.length
            ? detail.items.map(function(item, index) {
                const statusColor = item.done ? '#15803D' : '#D97706';
                const statusBg = item.done ? '#DCFCE7' : '#FEF3C7';
                // medication mode: ชื่อผู้ป่วยขึ้นเป็นหัว, ยาลง meta
                // patient mode: ชื่อยาขึ้นเป็นหัว, ผู้ป่วยลง meta
                var titleText = isMedMode
                    ? (item.patientName || 'ไม่ระบุผู้ป่วย') + (item.patientBed ? ' · ' + item.patientBed : '')
                    : item.drugName;
                var metaParts = isMedMode
                    ? [item.drugName, item.dose || '', item.round || '', item.slot || ''].filter(Boolean)
                    : [item.patientName ? item.patientName + (item.patientBed ? ' · ' + item.patientBed : '') : '', item.dose || '', item.round || '', item.slot || ''].filter(Boolean);
                const lotText = [item.lot && item.lot !== 'N/A' && item.lot !== '' ? 'Lot ' + item.lot : '', item.exp && item.exp !== 'N/A' && item.exp !== '' ? 'Exp ' + item.exp : ''].filter(Boolean).join(' · ');
                return '<div style="display:flex;align-items:flex-start;gap:10px;padding:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;">'
                    + '<div style="width:28px;height:28px;border-radius:10px;background:' + th.bg + ';border:1px solid ' + th.border + ';display:flex;align-items:center;justify-content:center;color:' + th.color + ';font-size:11px;font-weight:900;flex-shrink:0;">' + (index + 1) + '</div>'
                    + '<div style="flex:1;min-width:0;">'
                        + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
                            + '<span style="font-size:13px;font-weight:850;color:#0f172a;line-height:1.25;">' + escHtml(titleText) + '</span>'
                            + (item.highAlert ? '<span style="background:#FEE2E2;color:#B91C1C;border:1px solid #FECACA;font-size:9px;font-weight:900;padding:2px 6px;border-radius:999px;">HA</span>' : '')
                            + (item.interactionSeverity ? '<span style="background:#FFF7ED;color:#C2410C;border:1px solid #FDBA74;font-size:9px;font-weight:900;padding:2px 6px;border-radius:999px;">Interaction</span>' : '')
                        + '</div>'
                        + '<div style="font-size:11px;color:#64748b;font-weight:650;line-height:1.45;margin-top:4px;">' + escHtml(metaParts.join(' · ') || 'ยังไม่มีปลายทาง') + '</div>'
                        + (lotText ? '<div style="font-size:10px;color:#94A3B8;font-weight:650;margin-top:3px;">' + escHtml(lotText) + '</div>' : '')
                        + (item.interactionDrug ? '<div style="font-size:10px;color:#C2410C;font-weight:750;margin-top:3px;">ชนกับ ' + escHtml(item.interactionDrug) + '</div>' : '')
                    + '</div>'
                    + '<span style="font-size:10px;font-weight:900;color:' + statusColor + ';background:' + statusBg + ';border:1px solid rgba(15,23,42,0.06);padding:4px 8px;border-radius:999px;white-space:nowrap;">' + escHtml(item.status) + '</span>'
                    + '</div>';
            }).join('')
            : '<div style="padding:18px;border:1px dashed #CBD5E1;border-radius:14px;background:#F8FAFC;text-align:center;color:#64748b;font-size:13px;font-weight:700;">'
                + (detail.isMaintenance ? 'ช่องนี้ไม่พร้อมใช้ จึงยังไม่มีรายการยา' : 'ช่องนี้ยังว่าง พร้อมเลือกใช้งาน')
            + '</div>';
        const infoRows = [
            cassetteDetailInfoRow('รถเข็น', detail.cart.name || 'Med Cart'),
            cassetteDetailInfoRow('Ward', currentWardName || detail.cart.ward || DEFAULT_DEMO_WARD),
            cassetteDetailInfoRow('ตำแหน่ง', 'Drawer ' + detail.drawer + ' · Cassette ' + detail.cassette),
            cassetteDetailInfoRow('ประเภท', modeLabel),
            cassetteDetailInfoRow('สถานะ', statusLabel),
            cassetteDetailInfoRow('รายการยา', detail.items.length ? detail.items.length + ' รายการ' : '-'),
            cassetteDetailInfoRow('เวลาบันทึก', formatCassetteDetailTime((detail.completed && detail.completed.completedAt) || (detail.lock && detail.lock.completedAt)))
        ].join('');

        let modal = document.getElementById('cassetteDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cassetteDetailModal';
            document.body.appendChild(modal);
        }
        modal.style.cssText = 'position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.5);backdrop-filter:blur(8px);padding:18px;';
        modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
        modal.innerHTML =
            '<div style="width:100%;max-width:760px;max-height:90vh;background:white;border-radius:28px;box-shadow:0 28px 82px rgba(15,23,42,0.32);overflow:hidden;animation:fadeInUp .22s ease;display:flex;flex-direction:column;">'
                + '<div style="padding:22px 24px;background:linear-gradient(135deg,' + th.bg + ',#fff);border-bottom:1px solid #E2E8F0;position:relative;flex-shrink:0;">'
                    + '<button type="button" id="cassetteDetailCloseBtn" aria-label="ปิดรายละเอียด Cassette" style="position:absolute;top:14px;right:14px;z-index:10;width:34px;height:34px;border:none;border-radius:50%;background:rgba(255,255,255,0.8);box-shadow:0 4px 14px rgba(15,23,42,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#334155;">'
                        + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                    + '</button>'
                    + '<div style="display:flex;gap:16px;align-items:center;position:relative;z-index:1;padding-right:34px;">'
                        + '<div style="width:64px;height:64px;border-radius:21px;background:white;border:2px solid ' + th.border + ';display:flex;align-items:center;justify-content:center;box-shadow:0 12px 26px rgba(15,23,42,0.12);flex-shrink:0;">'
                            + '<span style="font-size:20px;font-weight:950;color:' + th.color + ';">C' + detail.cassette + '</span>'
                        + '</div>'
                        + '<div style="min-width:0;">'
                            + '<div style="font-size:10px;font-weight:950;color:' + th.color + ';letter-spacing:.16em;text-transform:uppercase;">Cassette Detail</div>'
                            + '<div style="font-size:24px;font-weight:950;color:#0f172a;letter-spacing:-.05em;margin-top:2px;">Drawer ' + detail.drawer + ' · Cassette ' + detail.cassette + '</div>'
                            + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;">'
                                + '<span style="font-size:11px;font-weight:900;color:' + th.color + ';background:' + th.bg + ';border:1px solid ' + th.border + ';padding:5px 10px;border-radius:999px;">' + escHtml(statusLabel) + '</span>'
                                + '<span style="font-size:11px;font-weight:900;color:#475569;background:white;border:1px solid #E2E8F0;padding:5px 10px;border-radius:999px;">' + escHtml(modeLabel) + '</span>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '<div style="padding:20px 24px 22px;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;">'
                    + '<div>'
                        + '<div style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">รายละเอียดช่อง</div>'
                        + '<div style="border:1px solid #E2E8F0;border-radius:18px;padding:0 14px;background:#F8FAFC;">' + infoRows + '</div>'
                    + '</div>'
                    + '<div>'
                        + '<div style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">รายการยาในช่องนี้</div>'
                        + '<div style="display:grid;gap:8px;">' + drugList + '</div>'
                    + '</div>'
                    + '<div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
                        + '<button type="button" id="cassetteDetailDrawerBtn" style="height:44px;border:1px solid #CBD5E1;background:#F8FAFC;color:#334155;border-radius:14px;font-size:13px;font-weight:900;cursor:pointer;">ดูทั้ง Drawer</button>'
                        + '<button type="button" id="cassetteDetailDoneBtn" style="height:44px;border:none;background:#0D9488;color:white;border-radius:14px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(13,148,136,0.22);">ปิด</button>'
                    + '</div>'
                + '</div>'
            + '</div>';
        const closeBtn = document.getElementById('cassetteDetailCloseBtn');
        const doneBtn = document.getElementById('cassetteDetailDoneBtn');
        const drawerBtn = document.getElementById('cassetteDetailDrawerBtn');
        if (closeBtn) closeBtn.onclick = function() { modal.style.display = 'none'; };
        if (doneBtn) doneBtn.onclick = function() { modal.style.display = 'none'; };
        if (drawerBtn) drawerBtn.onclick = function() {
            modal.style.display = 'none';
            showDrawerDetailModal(drawerNum);
        };
    }

    function showDrawerDetailModal(drawerNum) {
        const state = getDashboardCassetteState();
        const cart = state.cart || {};
        const modeTheme = {
            patient:     { color:'#0D9488', light:'#CCFBF1', border:'#5EEAD4', bg:'linear-gradient(135deg,#CCFBF1,#F0FDFA)', dot:'#14B8A6', label:'By Patient' },
            medication:  { color:'#2563EB', light:'#DBEAFE', border:'#93C5FD', bg:'linear-gradient(135deg,#DBEAFE,#EFF6FF)', dot:'#3B82F6', label:'By Item' },
            schedule:    { color:'#7C3AED', light:'#EDE9FE', border:'#C4B5FD', bg:'linear-gradient(135deg,#EDE9FE,#F5F3FF)', dot:'#A78BFA', label:'By Round' },
            prn:         { color:'#BE185D', light:'#FCE7F3', border:'#FBCFE8', bg:'linear-gradient(135deg,#FCE7F3,#FDF2F8)', dot:'#DB2777', label:'PRN Stock' },
            completed:   { color:'#1D4ED8', light:'#DBEAFE', border:'#93C5FD', bg:'linear-gradient(135deg,#DBEAFE,#EFF6FF)', dot:'#3B82F6', label:'เติมแล้ว' },
            maintenance: { color:'#DC2626', light:'#FEE2E2', border:'#FECACA', bg:'linear-gradient(135deg,#FEE2E2,#FEF2F2)', dot:'#F87171', label:'ไม่พร้อม' },
            ready:       { color:'#15803D', light:'#DCFCE7', border:'#BBF7D0', bg:'linear-gradient(135deg,#DCFCE7,#F0FDF4)', dot:'#22C55E', label:'พร้อมใช้' }
        };
        const cassettes = [];
        for (let c = 1; c <= state.perDrawer; c++) {
            const globalIndex = ((drawerNum - 1) * state.perDrawer) + c;
            if (globalIndex > state.total) break;
            const detail = getDashboardCassetteDetail(drawerNum, c);
            const modeKey = detail.isManuallyClosed ? 'maintenance' : detail.isMaintenance ? 'maintenance' : detail.lock ? detail.lock.mode : 'ready';
            const themeKey = (modeKey === 'prn') ? 'prn' : (detail.isCompleted ? 'completed' : modeKey);
            cassettes.push({
                num: c,
                detail: detail,
                theme: modeTheme[themeKey] || modeTheme.ready,
                statusLabel: detail.isManuallyClosed ? 'ปิดใช้งาน' : detail.isMaintenance ? 'ไม่พร้อมใช้' : detail.isCompleted ? 'เติมยาเรียบร้อยแล้ว' : detail.lock ? 'กำลังจัดยา' : 'พร้อมใช้',
                modeLabel: detail.isManuallyClosed ? 'ปิดโดย Backoffice' : detail.cfg ? detail.cfg.dashboardLabel : (detail.isMaintenance ? 'Maintenance' : 'Ready')
            });
        }
        const occupied = cassettes.filter(function(c){ return c.detail.lock || c.detail.items.length || c.detail.isCompleted; });
        const completed = cassettes.filter(function(c){ return c.detail.isCompleted; });
        const ready = cassettes.filter(function(c){ return c.detail.isReady; });
        const maintenance = cassettes.filter(function(c){ return c.detail.isMaintenance; });
        const totalItems = cassettes.reduce(function(sum, c){ return sum + (c.detail.items || []).length; }, 0);

        const cassetteGrid = cassettes.map(function(c) {
            const th = c.theme;
            const itemCount = (c.detail.items || []).length;
            const closedStyle = c.detail.isManuallyClosed ? 'cursor:not-allowed;pointer-events:none;opacity:0.75;' : 'cursor:pointer;';
            const clickAttr = c.detail.isManuallyClosed ? '' : 'onclick="event.stopPropagation();showCassetteDetailModal(' + drawerNum + ',' + c.num + ')" ';
            return '<button type="button" ' + clickAttr + 'title="Drawer ' + drawerNum + ' · Cassette ' + c.num + '" style="border:none;background:' + th.bg + ';border:1.5px solid ' + th.border + ';border-radius:16px;min-height:68px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:10px;' + closedStyle + 'box-shadow:0 2px 10px rgba(15,23,42,0.05);position:relative;overflow:hidden;">'
                + '<span style="position:absolute;width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,0.6);right:-22px;top:-20px;"></span>'
                + '<div style="display:flex;align-items:center;justify-content:space-between;width:100%;position:relative;z-index:1;">'
                    + '<span style="font-size:13px;font-weight:950;color:' + th.color + ';">C' + c.num + '</span>'
                    + '<span style="width:9px;height:9px;border-radius:50%;background:' + th.dot + ';box-shadow:0 0 0 3px rgba(255,255,255,0.7);"></span>'
                + '</div>'
                + '<div style="position:relative;z-index:1;">'
                    + '<div style="font-size:9px;font-weight:900;color:' + th.color + ';line-height:1;">' + escHtml(c.statusLabel) + '</div>'
                    + '<div style="font-size:9px;color:#64748b;font-weight:750;margin-top:3px;">' + itemCount + ' รายการยา</div>'
                + '</div>'
                + '</button>';
        }).join('');

        const statCards = [
            { val:cassettes.length, label:'Cassette', sub:'ทั้งหมด', color:'#0f172a', bg:'#F8FAFC' },
            { val:occupied.length, label:'ใช้งาน', sub:totalItems + ' รายการยา', color:'#0D9488', bg:'#F0FDFA' },
            { val:completed.length, label:'เติมแล้ว', sub:'บันทึกครบ', color:'#1D4ED8', bg:'#EFF6FF' },
            { val:ready.length, label:'พร้อมใช้', sub:'เลือกได้', color:'#15803D', bg:'#F0FDF4' },
            { val:maintenance.length, label:'ไม่พร้อม', sub:'งดใช้', color:'#B91C1C', bg:'#FEF2F2' }
        ].map(function(card) {
            return '<div style="background:' + card.bg + ';border:1px solid #E2E8F0;border-radius:16px;padding:12px 14px;min-width:104px;">'
                + '<div style="font-size:24px;font-weight:950;color:' + card.color + ';line-height:1;">' + card.val + '</div>'
                + '<div style="font-size:11px;font-weight:900;color:#334155;margin-top:6px;">' + escHtml(card.label) + '</div>'
                + '<div style="font-size:9px;font-weight:700;color:#94A3B8;margin-top:2px;">' + escHtml(card.sub) + '</div>'
                + '</div>';
        }).join('');

        const cassCards = occupied.length > 0
            ? occupied.map(function(c) {
                const th = c.theme;
                const items = c.detail.items || [];
                const preview = items.slice(0, 3).map(function(item) {
                    return '<div style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid #F1F5F9;">'
                        + '<span style="width:8px;height:8px;border-radius:50%;background:' + th.dot + ';margin-top:5px;flex-shrink:0;"></span>'
                        + '<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:850;color:#0f172a;">' + escHtml(item.drugName) + '</div>'
                        + '<div style="font-size:10px;color:#64748b;font-weight:650;line-height:1.35;">' + escHtml([item.patientName, item.patientBed, item.dose, item.round].filter(Boolean).join(' · ')) + '</div></div>'
                        + '<span style="font-size:9px;font-weight:900;color:' + (item.done ? '#15803D' : '#D97706') + ';background:' + (item.done ? '#DCFCE7' : '#FEF3C7') + ';border-radius:999px;padding:3px 7px;white-space:nowrap;">' + escHtml(item.status || (item.done ? 'จัดแล้ว' : 'รอจัด')) + '</span>'
                        + '</div>';
                }).join('');
                const extraCount = Math.max(items.length - 3, 0);
                return '<button type="button" onclick="showCassetteDetailModal(' + drawerNum + ',' + c.num + ')" style="text-align:left;width:100%;border:none;background:white;border:1.5px solid ' + th.border + ';border-radius:20px;margin-bottom:12px;overflow:hidden;box-shadow:0 5px 18px rgba(15,23,42,0.05);cursor:pointer;padding:0;">'
                    + '<div style="background:' + th.bg + ';padding:14px 16px;display:flex;align-items:center;gap:12px;">'
                        + '<div style="width:44px;height:44px;background:white;border:1px solid ' + th.border + ';border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,23,42,0.08);font-size:14px;font-weight:950;color:' + th.color + ';">C' + c.num + '</div>'
                        + '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:950;color:#0f172a;">Cassette ' + c.num + '</div><div style="font-size:11px;color:#475569;font-weight:750;margin-top:2px;">' + escHtml(c.modeLabel) + ' · ' + items.length + ' รายการยา</div></div>'
                        + '<span style="font-size:10px;font-weight:900;color:' + th.color + ';background:rgba(255,255,255,0.78);border:1px solid ' + th.border + ';border-radius:999px;padding:5px 9px;">' + escHtml(c.statusLabel) + '</span>'
                    + '</div>'
                    + '<div style="padding:4px 16px 12px;">' + (preview || '<div style="font-size:12px;color:#94A3B8;font-weight:700;padding:12px 0;">ยังไม่มีรายการยาในช่องนี้</div>') + (extraCount ? '<div style="font-size:10px;color:#64748b;font-weight:850;padding-top:8px;border-top:1px solid #F1F5F9;">+' + extraCount + ' รายการเพิ่มเติม · กดเพื่อดูทั้งหมด</div>' : '') + '</div>'
                    + '</button>';
            }).join('')
            : '<div style="text-align:center;padding:42px 20px;background:white;border:1px dashed #CBD5E1;border-radius:22px;">'
                + '<div style="width:58px;height:58px;background:#F1F5F9;border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">'
                    + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
                + '</div>'
                + '<div style="font-size:15px;font-weight:900;color:#475569;">Drawer นี้ยังว่างอยู่</div>'
                + '<div style="font-size:12px;color:#94A3B8;font-weight:650;margin-top:4px;">ทุก Cassette พร้อมสำหรับการจัดยาใหม่</div>'
            + '</div>';

        let modal = document.getElementById('drawerDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'drawerDetailModal';
            document.body.appendChild(modal);
        }
        modal.style.cssText = 'position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.54);backdrop-filter:blur(10px);padding:18px;';
        modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
        modal.innerHTML =
        '<div style="background:#F8FAFC;border-radius:30px;width:100%;max-width:920px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 90px rgba(15,23,42,0.34);animation:fadeInUp .22s cubic-bezier(0.22,1,0.36,1);">'
            + '<div style="background:linear-gradient(135deg,#FFFFFF 0%,#F0FDFA 52%,#EFF6FF 100%);border-bottom:1px solid #E2E8F0;padding:22px 24px 20px;position:relative;flex-shrink:0;">'
                + '<div style="display:flex;align-items:flex-start;gap:16px;position:relative;z-index:1;">'
                    + '<div style="width:58px;height:58px;background:linear-gradient(135deg,#0D9488,#14B8A6);border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px rgba(13,148,136,0.24);flex-shrink:0;">'
                        + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
                    + '</div>'
                    + '<div style="flex:1;min-width:0;">'
                        + '<div style="font-size:10px;font-weight:950;color:#0D9488;letter-spacing:.18em;text-transform:uppercase;">Drawer Overview</div>'
                        + '<div style="font-size:27px;font-weight:950;color:#0f172a;letter-spacing:-.05em;margin-top:2px;">Drawer ' + drawerNum + '</div>'
                        + '<div style="font-size:12px;color:#64748b;font-weight:750;margin-top:4px;">' + escHtml(cart.name || 'Med Cart') + ' · ' + escHtml(currentWardName || cart.ward || DEFAULT_DEMO_WARD) + ' · ' + cassettes.length + ' Cassette</div>'
                    + '</div>'
                    + '<button type="button" id="drawerDetailCloseBtn" aria-label="ปิดรายละเอียด Drawer" style="width:40px;height:40px;background:white;border:1px solid #E2E8F0;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 20px rgba(15,23,42,0.08);flex-shrink:0;">'
                        + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                    + '</button>'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:20px;position:relative;z-index:1;">' + statCards + '</div>'
            + '</div>'
            + '<div style="padding:20px;overflow-y:auto;flex:1;display:grid;grid-template-columns:minmax(260px,0.92fr) minmax(0,1.08fr);gap:18px;">'
                + '<div style="display:flex;flex-direction:column;gap:14px;">'
                    + '<div style="background:white;border:1px solid #E2E8F0;border-radius:24px;padding:16px;box-shadow:0 8px 28px rgba(15,23,42,0.05);">'
                        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div><div style="font-size:13px;font-weight:950;color:#0f172a;">Drawer Map</div><div style="font-size:10px;color:#94A3B8;font-weight:750;margin-top:2px;">กดช่องเพื่อดูรายละเอียดราย Cassette</div></div><span style="font-size:10px;font-weight:900;color:#0D9488;background:#F0FDFA;border:1px solid #99F6E4;border-radius:999px;padding:5px 9px;">' + cassettes.length + ' ช่อง</span></div>'
                        + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">' + cassetteGrid + '</div>'
                    + '</div>'
                    + '<div style="background:white;border:1px solid #E2E8F0;border-radius:20px;padding:14px 16px;box-shadow:0 6px 18px rgba(15,23,42,0.04);">'
                        + '<div style="font-size:11px;font-weight:950;color:#94A3B8;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">Legend</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:8px;">'
                            + '<span style="font-size:10px;font-weight:850;color:#0D9488;background:#F0FDFA;border:1px solid #99F6E4;border-radius:999px;padding:5px 9px;">By Patient</span>'
                            + '<span style="font-size:10px;font-weight:850;color:#2563EB;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:999px;padding:5px 9px;">By Item</span>'
                            + '<span style="font-size:10px;font-weight:850;color:#7C3AED;background:#F5F3FF;border:1px solid #DDD6FE;border-radius:999px;padding:5px 9px;">By Round</span>'
                            + '<span style="font-size:10px;font-weight:850;color:#15803D;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:999px;padding:5px 9px;">Ready</span>'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '<div style="min-width:0;">'
                    + '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:2px 2px 12px;"><div><div style="font-size:15px;font-weight:950;color:#0f172a;">Cassette ที่มีรายการ</div><div style="font-size:11px;color:#94A3B8;font-weight:750;margin-top:2px;">แสดงรายการยาจากข้อมูล dynamic ในช่องนี้</div></div><span style="font-size:11px;font-weight:950;color:#0D9488;background:#F0FDFA;border:1px solid #99F6E4;border-radius:999px;padding:6px 10px;">' + occupied.length + ' ช่อง</span></div>'
                    + '<div>' + cassCards + '</div>'
                + '</div>'
            + '</div>'
        + '</div>';
        const closeBtn = document.getElementById('drawerDetailCloseBtn');
        if (closeBtn) closeBtn.onclick = function() { modal.style.display = 'none'; };
    }

    function renderDashboardDynamic() {
        // Sync from central store first
        if (typeof MedCartStore !== 'undefined' && MedCartStore.orders.length > 0) {
            syncDashboardFromStore();
        }
        const metrics = getDashboardMetrics();
        const ward = currentWardName || DEFAULT_DEMO_WARD;
        var storeStats = (typeof MedCartStore !== 'undefined' && MedCartStore.orders.length > 0) ? MedCartStore.getDashStats() : null;
        var bannerPending = storeStats ? storeStats.pending : metrics.pending;
        var bannerDone = storeStats ? storeStats.done : metrics.done;
        var bannerTotal = storeStats ? storeStats.totalMeds : metrics.total;
        var bannerPct = storeStats ? storeStats.pctDone : metrics.percent;
        const bannerSub = document.querySelector('#pg-dashboard .db-banner-sub');
        if (bannerSub) bannerSub.innerHTML = 'มีรายการยา <strong style="color:var(--green);">' + bannerPending + ' รายการ</strong> รอดำเนินการ · จ่ายแล้ว <strong style="color:var(--green);">' + bannerDone + ' จาก ' + bannerTotal + '</strong> รายการ';
        const progressNum = document.querySelector('#pg-dashboard .db-progress-num');
        if (progressNum) progressNum.textContent = bannerPct + '%';
        const progressCircle = document.querySelector('#pg-dashboard .db-progress svg circle:nth-child(2)');
        if (progressCircle) progressCircle.setAttribute('stroke-dashoffset', String(Math.round(251 - (251 * bannerPct / 100))));
        const cartState = getDashboardCassetteState();
        const donePct = metrics.total ? Math.round((metrics.done / metrics.total) * 100) : 0;
        const pendingPct = metrics.total ? Math.round((metrics.pending / metrics.total) * 100) : 0;
        const statPatients = document.getElementById('dashStatPatients');
        const statPatientsSub = document.getElementById('dashStatPatientsSub');
        const statMeds = document.getElementById('dashStatMeds');
        const statMedsSub = document.getElementById('dashStatMedsSub');
        const statDone = document.getElementById('dashStatDone');
        const statDoneBar = document.getElementById('dashStatDoneBar');
        const statPending = document.getElementById('dashStatPending');
        const statPendingBar = document.getElementById('dashStatPendingBar');
        // Use store data if available (more accurate), fallback to legacy metrics
        var ss = storeStats || {};
        var useStore = !!storeStats;
        var displayPatients = useStore ? ss.patients : metrics.patients;
        var displayTotal = useStore ? ss.totalMeds : metrics.total;
        var displayDone = useStore ? ss.done : metrics.done;
        var displayPending = useStore ? ss.pending : metrics.pending;
        var displayDonePct = useStore ? ss.pctDone : donePct;
        var displayPendPct = useStore ? (100 - ss.pctDone) : pendingPct;
        if (statPatients) statPatients.textContent = displayPatients;
        if (statPatientsSub) statPatientsSub.textContent = ward + ' ทั้งหมด';
        if (statMeds) statMeds.textContent = displayTotal;
        if (statMedsSub) statMedsSub.textContent = 'คำสั่งยาจาก HIS + Manual';
        if (statDone) statDone.textContent = displayDone;
        if (statDoneBar) statDoneBar.style.width = displayDonePct + '%';
        if (statPending) statPending.textContent = displayPending;
        if (statPendingBar) statPendingBar.style.width = displayPendPct + '%';
        var donePctEl = document.getElementById('dashStatDonePct');
        var pendPctEl = document.getElementById('dashStatPendingPct');
        if (donePctEl) donePctEl.textContent = displayDonePct + '% ของทั้งหมด';
        if (pendPctEl) pendPctEl.textContent = displayPendPct + '% ของทั้งหมด';
        renderDashboardCassetteUsageCard(cartState);
        // Action badges & alert nums — prefer store data
        var storeStats = (typeof MedCartStore !== 'undefined' && MedCartStore.orders.length > 0) ? MedCartStore.getDashStats() : null;
        var storePrepPending = storeStats ? MedCartStore.countByStatus('scheduled') + MedCartStore.countByStatus('ordered') : metrics.pending;
        var storeDispPending = storeStats ? (storeStats.totalMeds - storeStats.done) : metrics.pending;
        const actionBadges = document.querySelectorAll('#pg-dashboard .db-action-badge');
        if (actionBadges[0]) actionBadges[0].textContent = storePrepPending + ' รอจัด';
        if (actionBadges[1]) actionBadges[1].textContent = storeDispPending + ' รอจ่าย';
        // STAT alert only
        var statAlertNum = document.querySelector('#dashQuickAlerts .db-alert-num');
        if (statAlertNum) statAlertNum.textContent = storeStats ? storeStats.stat : (typeof stPatients !== 'undefined' ? stPatients.length : 0);

        // ── Activity log — render from MedCartStore ──
        var logWrap = document.getElementById('dashActivityLogWrap');
        if (logWrap && typeof MedCartStore !== 'undefined' && MedCartStore.orders.length > 0) {
            // Filter activity by role:
            // Nurse: dispensed/assessed only (จ่ายยา)
            // Pharma: prepped only (จัดยา) — but pharma panel is hidden, this is fallback
            // Super: all statuses
            var role = typeof currentRole !== 'undefined' ? currentRole : 'super';
            var storeOrders = MedCartStore.orders.slice();
            if (role === 'nurse') {
                storeOrders = storeOrders.filter(function(o){ return o.status === 'dispensed' || o.status === 'assessed'; });
            } else if (role === 'pharma') {
                storeOrders = storeOrders.filter(function(o){ return o.status === 'prepped' || o.status === 'dispensed'; });
            }
            var statusOrder = { dispensed:0, assessed:0, prepped:1, scheduled:2, ordered:3 };
            storeOrders.sort(function(a,b){ return (statusOrder[a.status]||9) - (statusOrder[b.status]||9); });
            var activityItems = storeOrders.slice(0, 5);
            var demoTimes = ['08:12','08:08','07:55','07:45','07:30'];
            if (!activityItems.length) {
                logWrap.innerHTML = '<div style="padding:18px;text-align:center;color:var(--text-3);font-size:12px;">ยังไม่มีกิจกรรม</div>';
            } else {
            logWrap.innerHTML = activityItems.map(function(o, idx) {
                var border = idx === activityItems.length - 1 ? '' : 'border-bottom:1px dashed #f1f5f9;';
                var isDone = o.status === 'dispensed' || o.status === 'assessed';
                var isHA = o.highAlert;
                var isPrep = o.status === 'prepped';
                var color = isDone ? '#0D9488' : isHA ? '#d97706' : isPrep ? '#3b82f6' : '#64748b';
                var bg = isDone ? '#f0fdf4' : isHA ? '#fffbeb' : isPrep ? '#eff6ff' : '#f8fafc';
                var action = isDone ? 'จ่ายยา' : isPrep ? 'จัดยา' : o.status === 'scheduled' ? 'รอจ่าย' : 'รับคำสั่ง';
                var icon = isDone
                    ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                    : isPrep ? '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'
                    : isHA ? '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
                    : '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>';
                var ptName = MedCartStore.getPatientName(o.patient);
                var ptBed = MedCartStore.getPatientBed(o.patient);
                return '<div class="db-log-item" style="' + border + 'padding:10px 8px;">'
                    + '<div style="width:32px;height:32px;background:' + bg + ';border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
                    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2.5">' + icon + '</svg></div>'
                    + '<div style="flex:1;min-width:0;"><div class="db-log-text">' + action + ' <strong>' + escHtml(o.drug) + '</strong></div>'
                    + '<div style="font-size:11px;color:var(--text-3);">' + escHtml(ptName) + ' · ห้อง ' + escHtml(ptBed) + '</div></div>'
                    + '<div class="db-log-time">' + (demoTimes[idx] || o.createdAt || '—') + '</div></div>';
            }).join('');
            }
        } else if (logWrap) {
            // Fallback to legacy
            var legacyKeys = getDispensePatientKeys().slice(0, 5);
            logWrap.innerHTML = legacyKeys.map(function(key, idx) {
                var pt = patientData[key]; if (!pt) return '';
                var drug = (pt.drugs || [])[0] || {};
                var border = idx === legacyKeys.length - 1 ? '' : 'border-bottom:1px dashed #f1f5f9;';
                var done = !!drug.done;
                var color = done ? '#0D9488' : '#3b82f6'; var bg = done ? '#f0fdf4' : '#eff6ff';
                return '<div class="db-log-item" style="' + border + 'padding:10px 8px;"><div style="width:32px;height:32px;background:' + bg + ';border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div style="flex:1;min-width:0;"><div class="db-log-text">' + (done?'จ่ายยา':'รอจ่าย') + ' <strong>' + escHtml(drug.name||'—') + '</strong></div><div style="font-size:11px;color:var(--text-3);">' + escHtml(pt.name) + ' · ห้อง ' + escHtml(pt.bed) + '</div></div><div class="db-log-time">' + (['08:12','08:08','07:55','07:45','07:30'][idx]||'—') + '</div></div>';
            }).join('');
        }
        const roleSection = document.getElementById('dashRoleSection');
        if (roleSection && (currentRole === 'nurse' || currentRole === 'pharma')) {
            roleSection.innerHTML = getRoleSectionHTML(currentRole);
        }
        renderDashboardCassettePanel();
        renderOrderPlanDashboardHint();
        renderEmarDashboardHint();
    }

    function buildAssessmentRows() {
        const rows = [];
        const prn = typeof prnPatients !== 'undefined' ? prnPatients[0] : null;
        if (prn) rows.push({ status:'pending', patient:prn.name, bed:prn.hn + ' · ' + prn.bed, drug:prn.drug, detail:prn.route + ' · ' + prn.dose, type:'PRN', givenTime:'08:18 น.', showPain:true });
        const ov = typeof ovPatients !== 'undefined' ? ovPatients[0] : null;
        if (ov) rows.push({ status:'pending', patient:ov.name, bed:ov.hn + ' · ' + ov.bed, drug:ov.drug, detail:ov.route + ' · ' + ov.dose, type:'Overdue', givenTime:'08:18 น.', showPain:false });
        const ha = typeof haPatients !== 'undefined' ? haPatients[0] : null;
        if (ha) rows.push({ status:'pending', patient:ha.name, bed:ha.hn + ' · ' + ha.bed, drug:ha.drug, detail:ha.route + ' · ' + ha.dose, type:'High Alert', givenTime:'08:10 น.', showPain:false });
        getDispensePatientKeys().forEach(function(key, idx) {
            const pt = patientData[key];
            const drug = (pt.drugs || [])[0];
            if (!drug || rows.length >= 8) return;
            const d = legacyDrugView(drug, pt, 0);
            rows.push({ status:'done', patient:pt.name, bed:pt.hn + ' · ' + pt.bed, drug:d.name, detail:d.routeShort + ' · ' + d.dose, type:d.typeText, givenTime:['07:50 น.','07:45 น.','07:40 น.','07:35 น.','07:30 น.'][idx % 5], assessedTime:['08:20 น.','08:10 น.','08:05 น.','08:00 น.','07:55 น.'][idx % 5], showPain:false });
        });
        return rows.slice(0, 8);
    }

    function renderAssessmentListDynamic() {
        const list = document.getElementById('alList');
        if (!list) return;
        assessmentListCache = buildAssessmentRows();
        const pending = assessmentListCache.filter(function(r) { return r.status === 'pending'; }).length;
        const done = assessmentListCache.filter(function(r) { return r.status === 'done'; }).length;
        const summaryNums = document.querySelectorAll('#pg-assess-list [style*="font-size:22px"][style*="font-weight:800"]');
        if (summaryNums[0]) summaryNums[0].textContent = pending;
        if (summaryNums[1]) summaryNums[1].textContent = done;
        if (summaryNums[2]) summaryNums[2].textContent = assessmentListCache.length;
        const tabs = document.querySelectorAll('#alFilterTabs button');
        if (tabs[0]) tabs[0].textContent = 'ทั้งหมด (' + assessmentListCache.length + ')';
        if (tabs[1]) tabs[1].textContent = 'รอประเมิน (' + pending + ')';
        if (tabs[2]) tabs[2].textContent = 'ประเมินแล้ว (' + done + ')';
        list.innerHTML = assessmentListCache.map(function(row, idx) {
            const isPending = row.status === 'pending';
            const canDoAssessment = canAccessAssessment();
            const color = row.type === 'PRN' ? '#7c3aed' : row.type === 'High Alert' ? '#d97706' : row.type === 'Overdue' ? '#be123c' : '#059669';
            const bg = row.type === 'PRN' ? '#f5f3ff' : row.type === 'High Alert' ? '#fffbeb' : row.type === 'Overdue' ? '#fff1f2' : '#f0fdf4';
            const cardStyle = isPending && canDoAssessment ? 'background:white;border:1.5px solid #fca5a5;cursor:pointer;' : 'background:#f8fafb;border:1.5px solid #e2e8f0;';
            const click = isPending && canDoAssessment ? 'onclick="openAssessmentItem(' + idx + ')" onmouseover="this.style.boxShadow=\'0 4px 18px rgba(220,38,38,0.12)\';this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'"' : '';
            return '<div class="al-row" data-status="' + row.status + '" style="' + cardStyle + 'border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:14px;transition:all .18s;" ' + click + '>'
                + '<div style="width:42px;height:42px;background:' + bg + ';border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg></div>'
                + '<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;"><span style="font-size:14px;font-weight:700;color:' + (isPending ? '#1e293b' : '#475569') + ';">' + escHtml(row.patient) + '</span><span style="font-size:10px;color:#64748b;">' + escHtml(row.bed.split('·').pop().trim()) + '</span><span style="font-size:10px;font-weight:700;background:' + bg + ';color:' + color + ';padding:2px 8px;border-radius:6px;border:1px solid #ddd6fe;">' + escHtml(row.type) + '</span></div><div style="font-size:12px;color:#475569;margin-bottom:2px;">' + escHtml(row.drug) + ' · ' + escHtml(row.detail) + '</div><div style="font-size:11px;color:#94a3b8;">ให้ยาเมื่อ ' + escHtml(row.givenTime) + (row.assessedTime ? ' · ประเมินเมื่อ ' + escHtml(row.assessedTime) : '') + '</div></div>'
                + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;"><span style="font-size:11px;font-weight:700;background:' + (isPending ? '#fef2f2;color:#dc2626;border:1px solid #fca5a5;' : '#f0fdf4;color:#059669;border:1px solid #86efac;') + 'padding:3px 10px;border-radius:8px;">' + (isPending ? 'รอประเมิน' : 'ประเมินแล้ว') + '</span><span style="font-size:11px;color:' + (isPending && canDoAssessment ? '#059669' : '#94a3b8') + ';font-weight:600;">' + (isPending ? (canDoAssessment ? 'กดเพื่อประเมิน ->' : 'ไม่มีสิทธิ์ประเมิน') : 'ตอบสนองดีขึ้น') + '</span></div>'
                + '</div>';
        }).join('');
    }

    function openAssessmentItem(idx) {
        if (!canAccessAssessment()) {
            showAssessmentAccessDenied();
            return;
        }
        const row = assessmentListCache[idx];
        if (!row) return;
        goPostAssessI({ patient:row.patient, bed:row.bed, drug:row.drug, detail:row.detail, type:row.type, givenTime:row.givenTime, showPain:row.showPain, origin:'pg-assess-list' });
    }

    /* ── Omit (Page 15) ── */
    function pickOmit(el) {
        document.querySelectorAll('.omit-opt').forEach(o => {
            o.classList.remove('chosen');
            o.querySelector('svg').style.display = 'none';
        });
        el.classList.add('chosen');
        el.querySelector('svg').style.display = '';
        document.getElementById('btnOmitSave').disabled = false;
    }

    /* ── Record (Page 16) ── */
    function saveRecord() {
        const now = new Date();
        document.getElementById('okTimestamp').textContent =
            now.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) + ' น.';
        legacyLastGivenTime = document.querySelector('#pg-record .rec-doc-input[type="time"]')?.value
            ? document.querySelector('#pg-record .rec-doc-input[type="time"]').value + ' น.'
            : legacyLastGivenTime;
        const drug = getLegacyDrug();
        if (drug) {
            const pt = getLegacyPatient();
            const view = legacyDrugView(drug, pt, currentLegacyDrugIdx);
            drug.done = true;
            drug.status = 'ให้แล้ว ✓';
            drug.givenTime = legacyLastGivenTime;
            if (drug.orderPlanId) {
                updateOrderPlanStoredState(drug.orderPlanId, {
                    done: true,
                    givenAt: legacyLastGivenTime,
                    status: 'given'
                });
            }
            recordEmarAdministration(emarRecordFromRow({
                key: currentLegacyDispenseBed,
                idx: currentLegacyDrugIdx,
                pt: pt,
                drug: drug,
                view: view,
                highAlert: isLegacyHighAlertDrug(drug),
                prn: view.isPrn,
                orderPlan: !!drug.orderPlanId
            }, legacyLastGivenTime, 'บันทึกจาก flow ให้ยาปกติ'));
        }
        renderLegacySummaryPages();
        renderDispenseList();
        renderDashboardDynamic();
        renderAssessmentListDynamic();
        PatientDataNotifier.notify();
        nav('pg-success');
    }

    /* ── Witness / IDC (Page 14) ── */
    function switchWitTab(tab) {
        document.querySelectorAll('.wit-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.wit-panel').forEach(p => p.classList.remove('active'));
        if (tab === 'card') {
            document.querySelectorAll('.wit-tab')[0].classList.add('active');
            document.getElementById('witPanelCard').classList.add('active');
        } else if (tab === 'user') {
            document.querySelectorAll('.wit-tab')[1].classList.add('active');
            document.getElementById('witPanelUser').classList.add('active');
        } else {
            document.querySelectorAll('.wit-tab')[2].classList.add('active');
            document.getElementById('witPanelPin').classList.add('active');
        }
    }

    function demoWitness() {
        const now = new Date();
        legacyWitnessVerified = true;
        document.getElementById('witTime').textContent = now.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
        document.getElementById('witResult').classList.add('show');
        document.getElementById('witActions').classList.add('show');
        renderLegacySummaryPages();
        showToast('พยานยืนยันตัวตนสำเร็จ');
        setTimeout(() => showToast(''), 2000);
    }

    function resetWitness() {
        legacyWitnessVerified = false;
        document.getElementById('witResult').classList.remove('show');
        document.getElementById('witActions').classList.remove('show');
        renderLegacySummaryPages();
    }

    /* ── Admin Med (Page 13) ── */
    function selectAmDrug(el) {
        if (el.dataset.index !== undefined) {
            selectAmDrugByIndex(parseInt(el.dataset.index, 10));
            return;
        }
        if (el.classList.contains('done') || el.style.opacity === '0.6') return;
        document.querySelectorAll('.am-drug').forEach(d => d.classList.remove('active'));
        el.classList.add('active');
        // Reset 7 Rights และ scan result ทุกครั้งที่เปลี่ยนยา
        ['rDrug','rDose','rRoute'].forEach(id => {
            const r = document.getElementById(id);
            if (r) r.className = 'am-r pend';
        });
        const scanResult = document.getElementById('amScanResult');
        if (scanResult) scanResult.classList.remove('show');
        const confirmBtn = document.getElementById('btnConfirmAdmin');
        if (confirmBtn) confirmBtn.disabled = true;
    }

    function demoScanMed() {
        const d = legacyDrugView(getLegacyDrug(), getLegacyPatient(), currentLegacyDrugIdx);
        if (d.highAlert && !legacyWitnessVerified) {
            showHAVerifyModal(d.name, d.lot, function() {
                legacyWitnessVerified = true;
                renderLegacySummaryPages();
                completeLegacyScanMed();
            }, 'witness');
            return;
        }
        completeLegacyScanMed();
    }

    /* ── Scan Patient (Page 12) ── */
    function demoScanPt(type) {
        const illust = document.getElementById('sptIllust');
        const heading = document.getElementById('sptHeading');
        const hint = document.getElementById('sptHint');
        const scanBtn = document.getElementById('sptScanBtn');
        const result = document.getElementById('sptResult');
        const resultBox = document.getElementById('sptResultBox');
        const resultIcon = document.getElementById('sptResultIcon');
        const resultSvg = document.getElementById('sptResultSvg');
        const resultTitle = document.getElementById('sptResultTitle');
        const resultDetail = document.getElementById('sptResultDetail');
        const actions = document.getElementById('sptActions');
        const proceed = document.getElementById('sptProceed');
        const pt = getLegacyPatient();
        const mismatchPt = getDispensePatientKeys().map(function(key) { return patientData[key]; }).find(function(p) { return p && p.hn !== pt.hn; }) || patientData['05'] || pt;

        if (type === 'match') {
            illust.className = 'spt-illust success';
            document.getElementById('sptIcon').style.color = 'var(--green)';
            heading.className = 'spt-heading success';
            heading.textContent = 'ยืนยันตัวตนสำเร็จ';
            hint.textContent = 'ข้อมูลตรงกับผู้ป่วยเป้าหมาย';
            scanBtn.style.display = 'none';

            resultBox.className = 'spt-result-box match';
            resultIcon.className = 'spt-result-icon ok';
            resultSvg.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
            resultTitle.className = 'spt-result-title ok';
            resultTitle.textContent = 'ตรงกับผู้ป่วยเป้าหมาย';
            resultDetail.className = 'spt-result-detail ok';
            resultDetail.textContent = pt.name + ' · HN: ' + pt.hn + ' · เตียง ' + pt.bed;
            result.classList.add('show');

            proceed.disabled = false;
            proceed.style.opacity = '1';
            proceed.onclick = function() { renderAdminMedPage(false); nav('pg-admin-med'); };
            actions.classList.add('show');
        } else {
            illust.className = 'spt-illust fail';
            document.getElementById('sptIcon').style.color = '#dc2626';
            heading.className = 'spt-heading fail';
            heading.textContent = 'ผู้ป่วยไม่ตรงกัน';
            hint.textContent = 'ไม่สามารถดำเนินการให้ยาได้ กรุณาตรวจสอบอีกครั้ง';
            scanBtn.style.display = 'none';

            resultBox.className = 'spt-result-box mismatch';
            resultIcon.className = 'spt-result-icon err';
            resultSvg.innerHTML = '<line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="3"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="3"/>';
            resultTitle.className = 'spt-result-title err';
            resultTitle.textContent = 'ผู้ป่วยไม่ตรงกัน — ไม่สามารถดำเนินการต่อได้';
            resultDetail.className = 'spt-result-detail err';
            resultDetail.textContent = 'สแกนได้: ' + mismatchPt.name + ' · HN: ' + mismatchPt.hn + ' (ไม่ใช่ผู้ป่วยเป้าหมาย)';
            result.classList.add('show');

            proceed.disabled = true;
            proceed.style.opacity = '.5';
            actions.classList.add('show');
        }
    }

    function resetScanPt() {
        renderScanPatientPage();
        const illust = document.getElementById('sptIllust');
        illust.className = 'spt-illust idle';
        document.getElementById('sptIcon').style.color = 'var(--text-3)';
        document.getElementById('sptHeading').className = 'spt-heading';
        document.getElementById('sptHeading').textContent = 'กรุณาสแกนสายรัดข้อมือผู้ป่วย';
        document.getElementById('sptHint').innerHTML = 'ใช้เครื่องสแกนบาร์โค้ดที่ติดตั้งบนรถเข็น<br>สแกนที่สายรัดข้อมือของผู้ป่วยเพื่อยืนยันตัวตน';
        document.getElementById('sptScanBtn').style.display = '';
        document.getElementById('sptResult').classList.remove('show');
        document.getElementById('sptActions').classList.remove('show');
        const proceed = document.getElementById('sptProceed');
        if (proceed) {
            proceed.disabled = true;
            proceed.style.opacity = '.5';
            proceed.onclick = function() { renderAdminMedPage(false); nav('pg-admin-med'); };
        }
    }

    /* ── Summary (Page 9) ── */
    const defaultSummaryFlow = {
        editPage: 'pg-prep-fill-pt',
        continuePage: 'pg-prep-patient'
    };
    let summaryFlow = Object.assign({}, defaultSummaryFlow, getStoredSummaryFlow());

    function getStoredSummaryFlow() {
        try {
            return JSON.parse(sessionStorage.getItem('mcSummaryFlow') || '{}') || {};
        } catch (e) {
            return {};
        }
    }

    function setSummaryFlow(flow) {
        summaryFlow = Object.assign({}, defaultSummaryFlow, summaryFlow || {}, flow || {});
        try {
            sessionStorage.setItem('mcSummaryFlow', JSON.stringify(summaryFlow));
        } catch (e) {}
    }

    function markPreparedDrugByRef(ref, fallbackDrugName) {
        if (!ref) return false;
        let pt = ref.key ? patientData[ref.key] : null;
        if (!pt) pt = getIbfPatientSource(ref);
        if (!pt || !pt.drugs) return false;
        const target = normalizeIbfDrugName(fallbackDrugName || ref.name || '');
        let drug = Number.isInteger(ref.drugIdx) ? pt.drugs[ref.drugIdx] : null;
        if (drug && target && normalizeIbfDrugName(drug.name) !== target) drug = null;
        if (!drug) {
            drug = pt.drugs.find(function(item) {
                return !item.done && (!target || normalizeIbfDrugName(item.name) === target);
            });
        }
        if (!drug) return false;
        if (drug.done) return false;
        drug.done = true;
        drug.status = 'จัดแล้ว ✓';
        drug.prepared = true;
        drug.preparedTime = new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }) + ' น.';
        drug.preparedDrawer = ptdSelectedDrawer || '';
        drug.preparedCassette = ptdSelectedCass || '';
        drug.preparedSlot = ref.slot || '';
        drug.preparedFlow = summaryFlow.mode || '';
        if (drug.orderPlanId) {
            updateOrderPlanStoredState(drug.orderPlanId, {
                prepared: true,
                preparedAt: drug.preparedTime,
                preparedDrawer: drug.preparedDrawer,
                preparedCassette: drug.preparedCassette,
                preparedFlow: drug.preparedFlow
            });
        }
        PatientDataNotifier.notify();
        return true;
    }

    function summaryDoneFlags(selector) {
        return Array.from(document.querySelectorAll(selector)).map(function(item) {
            return item.classList.contains('done');
        });
    }

    function refreshDynamicPagesAfterDataCommit() {
        if (typeof syncWardFlowDatasets === 'function') {
            syncWardFlowDatasets();
        } else {
            renderDashboardDynamic();
            renderDispenseList();
            renderPrepTypePage();
            renderPrepPatientPage();
            renderPrepMedicationPage();
            renderPrepSchedulePage();
            renderPrepScheduleDetail();
            renderAssessmentListDynamic();
        }
        PatientDataNotifier.notify();
    }

    function commitPrepSummaryState() {
        const mode = summaryFlow.mode || (function() {
            const ctx = ((document.getElementById('sumContext') || {}).textContent || '').trim();
            if (ctx.includes('ตามรอบเวลา') || ctx.includes('รอบ:')) return 'schedule';
            if (ctx.includes('ตามข้อมูลคนไข้ปลายทาง') || ctx.includes('ยา:')) return 'medication';
            if (ctx.includes('ตามผู้ป่วย') || ctx.includes('ผู้ป่วย:')) return 'patient';
            return '';
        })();
        let changed = 0;
        if (mode === 'patient') {
            summaryDoneFlags('#pfListScroll .pf-drug-item').forEach(function(isDone, idx) {
                if (!isDone) return;
                const ref = { key: currentPatientBed, drugIdx: pfDrugIndexes[idx], name: pfDrugNames[idx] };
                if (markPreparedDrugByRef(ref, pfDrugNames[idx])) changed++;
            });
        } else if (mode === 'medication') {
            summaryDoneFlags('#ibfDestScroll .pf-drug-item').forEach(function(isDone, idx) {
                if (!isDone) return;
                if (markPreparedDrugByRef(ibfTargetRefs[idx], ibfDrugName)) changed++;
            });
        } else if (mode === 'schedule') {
            summaryDoneFlags('#trfQueue .pf-drug-item').forEach(function(isDone, idx) {
                if (!isDone) return;
                if (markPreparedDrugByRef(trfTargetRefs[idx], trfDrugNames[idx])) changed++;
            });
        }
        if (changed) refreshDynamicPagesAfterDataCommit();
        return changed;
    }

    function goSummaryBack() {
        nav(summaryFlow.editPage || 'pg-prep-fill-pt');
    }

    function inferSummaryContinuePage() {
        const ctx = ((document.getElementById('sumContext') || {}).textContent || '').trim();
        if (ctx.includes('ตามรอบเวลา') || ctx.includes('รอบ:')) return 'pg-prep-sched';
        if (ctx.includes('ตามข้อมูลคนไข้ปลายทาง') || ctx.includes('ยา:')) return 'pg-prep-med';
        if (ctx.includes('ตามผู้ป่วย') || ctx.includes('ผู้ป่วย:')) return 'pg-prep-patient';
        return summaryFlow.continuePage || 'pg-prep-type';
    }

    function goSummaryContinue() {
        const nextPage = inferSummaryContinuePage();
        setSummaryFlow({ continuePage: nextPage });
        const changed = commitPrepSummaryState();
        showToast('บันทึกผลการจัดยาแล้ว' + (changed ? ' ' + changed + ' รายการ' : '') + ' — กลับไปหน้าจัดยาต่อ');
        setTimeout(() => showToast(''), 1600);
        nav(nextPage, false, { replaceCurrent: true });
    }

    function saveSummary() {
        const changed = commitPrepSummaryState();
        showToast('บันทึกผลการจัดยาเรียบร้อย' + (changed ? ' ' + changed + ' รายการ' : '') + ' — กำลังกลับ Dashboard...');
        setTimeout(() => {
            showToast('');
            nav('pg-dashboard', false, { replaceCurrent: true });
        }, 2000);
    }

    function confirmBackDash() {
        if (confirm('คุณต้องการกลับ Dashboard โดยไม่บันทึกหรือไม่?\nรายการที่ยังไม่บันทึกจะไม่ถูกเก็บ')) {
            nav('pg-dashboard');
        }
    }

    /* ── Reset Demo ── */
    function resetDemo() {
        // Reset app session back to the first-use state.
        currentRole = 'nurse';
        currentWardName = DEFAULT_DEMO_WARD;
        selectedWardName = DEFAULT_DEMO_WARD;
        sessionStorage.removeItem('mcRole');
        sessionStorage.removeItem('mcName');
        sessionStorage.removeItem('mcRoleText');
        sessionStorage.removeItem('mcWard');
        sessionStorage.removeItem('mcSummaryFlow');
        sessionStorage.removeItem(ORDER_PLAN_STORE);
        sessionStorage.removeItem(EMAR_RECORD_STORE);
        emarCurrentFilter = 'all';
        emarSelectedRef = '';
        appNavStack.length = 0;
        summaryFlow = Object.assign({}, defaultSummaryFlow);
        document.body.classList.remove('logged-in');
        closeDashboardDetailModals();
        resetCassetteModeLocks();
        const ghUserSection = document.getElementById('ghUserSection');
        if (ghUserSection) ghUserSection.style.display = 'none';
        const ghBackendBtn = document.getElementById('ghBackendBtn');
        if (ghBackendBtn) ghBackendBtn.style.display = 'none';
        const ghLogoutBtn = document.getElementById('ghLogoutBtn');
        if (ghLogoutBtn) ghLogoutBtn.style.display = 'none';
        const permSec = document.getElementById('dashPermSection');
        if (permSec) permSec.style.display = 'none';
        const userInput = document.getElementById('inputUser');
        if (userInput) { userInput.value = ''; userInput.classList.remove('error'); }
        const pwInput = document.getElementById('inputPw');
        if (pwInput) { pwInput.value = ''; pwInput.classList.remove('error'); pwInput.type = 'password'; }
        ['loginError','cardError'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.classList.remove('show');
        });
        resetCardScan();

        // Restore the landing ward until the user explicitly selects another ward.
        applyWardSelection(DEFAULT_DEMO_WARD, { silent: true });
        sessionStorage.removeItem('mcWard');

        document.querySelectorAll('.wc').forEach(function(card) {
            card.classList.remove('chosen');
            const radio = card.querySelector('.wc-radio');
            if (radio) radio.innerHTML = '';
        });
        const wardBtn = document.getElementById('btnSelectConfirm');
        if (wardBtn) wardBtn.disabled = true;
        const wardSearch = document.getElementById('wardSearch');
        if (wardSearch) { wardSearch.value = ''; filterWards(); }

        // Reset all flow steps to 1
        rtGoStep(1);
        stGoStep(1);
        prnGoStep(1);
        haGoStep(1);
        ovGoStep(1);

        // Reset all multi-drug scan cards
        document.querySelectorAll('.mdc').forEach(card => {
            card.classList.remove('done');
            card.dataset.done = 'false';
        });
        document.querySelectorAll('[id$="_done"]').forEach(el => {
            if (el.id.match(/^(r|st|prn|ha|ov)drug_\d+_done$/)) el.style.display = 'none';
        });
        document.querySelectorAll('[id$="_btn"]').forEach(btn => {
            if (btn.id.match(/^(r|st|prn|ha|ov)drug_\d+_btn$/)) {
                btn.disabled = false;
                btn.style.display = '';
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="vertical-align:middle;margin-right:4px;"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>สแกน`;
            }
        });

        // Re-disable all confirm buttons
        ['rtBtnConfirmDrug','stBtnConfirm','btnPrnConfirm','haBtnWit','ovBtnConfirm'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });

        // Reset scan states hidden results
        ['rtDrugScanResult','stDrugResult','prnDrugResult','haDrugResult','ovDrugResult'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Navigate to the starting cart information screen
        setLegacyDispensePatient('01');
        renderDispenseList();
        renderDashboardDynamic();
        renderAssessmentListDynamic();
        nav('pg-cart', false, { replaceCurrent: true });
        appNavStack.length = 0;
        showToast('รีเซ็ต Demo เรียบร้อยแล้ว — กลับไปหน้าข้อมูลรถเข็น');
        setTimeout(() => showToast(''), 2200);
    }

    /* ── Logout ── */
    function doLogout() {
        // Clear session
        sessionStorage.removeItem('mcRole');
        sessionStorage.removeItem('mcName');
        sessionStorage.removeItem('mcRoleText');
        // Hide user section
        document.body.classList.remove('logged-in');
        document.getElementById('ghUserSection').style.display = 'none';
        const ghBackendBtn = document.getElementById('ghBackendBtn');
        if (ghBackendBtn) ghBackendBtn.style.display = 'none';
        const ghLogoutBtn = document.getElementById('ghLogoutBtn');
        if (ghLogoutBtn) ghLogoutBtn.style.display = 'none';
        // Reset login form
        document.getElementById('inputUser').value = '';
        document.getElementById('inputPw').value = '';
        document.getElementById('inputUser').classList.remove('error');
        document.getElementById('inputPw').classList.remove('error');
        document.getElementById('loginError').classList.remove('show');
        nav('pg-cart');
    }

    /* ── Drawer ── */
    function openDrawer() {
        document.getElementById('overlay').classList.add('open');
        document.getElementById('drawer').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        document.getElementById('overlay').classList.remove('open');
        document.getElementById('drawer').classList.remove('open');
        document.body.style.overflow = '';
    }

    /* ── Multi-Drug Scan ── */
    const scanButtonHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="vertical-align:middle;margin-right:4px;"><path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/><line x1="7" y1="12" x2="17" y2="12"/></svg>สแกน';
    const flowConfirmButtonTemplates = {
        r: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>ยืนยันให้ยา (%COUNT%)',
        st: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>ยืนยันให้ยา STAT (%COUNT%)',
        prn: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>ยืนยันให้ยา PRN (%COUNT%)',
        ha: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>ไปขั้นตอนพยาน (%COUNT%)',
        ov: 'ยืนยันให้ยา Overdue (%COUNT%)'
    };
    const multiDrugConfirmMap = {
        r:'rtBtnConfirmDrug', st:'stBtnConfirm', prn:'btnPrnConfirm', ha:'haBtnWit', ov:'ovBtnConfirm'
    };

    function getCurrentFlowPatient(flow) {
        if (flow === 'r') return dispensePatients[currentDispenseBed] || dispensePatients['01'];
        if (flow === 'st') return stPatients[stSelectedIdx] || stPatients[0];
        if (flow === 'prn') return prnPatients[prnSelectedIdx] || prnPatients[0];
        if (flow === 'ha') return haPatients[haSelectedIdx] || haPatients[0];
        if (flow === 'ov') return ovPatients[ovSelectedIdx] || ovPatients[0];
        return null;
    }

    function getCurrentFlowDrugs(flow) {
        if (flow === 'r') {
            return (rtDrugs || []).map(function(d) {
                const lotInfo = drugLotMap[d.name] || { lot:'N/A', exp:'N/A' };
                const routeShort = (d.route || '').split(' ')[0] || d.route || 'PO';
                return {
                    name: d.name,
                    requiresWitness: isHighAlertDrug(d.name),
                    nameHtml: d.name + haBadge(d.name),
                    scanSub: routeShort + ' · ' + d.dose + ' · ' + d.time + ' · ' + d.freq,
                    detail: routeShort + ' · ' + d.dose,
                    routeTh: d.route,
                    lot: lotInfo.lot,
                    exp: lotInfo.exp
                };
            });
        }

        if (flow === 'st') {
            const p = getCurrentFlowPatient(flow);
            if (!p) return [];
            const tags = ['<span class="mdc-badge-warn" style="background:#fef9c3;color:#854d0e;border-color:#fde047;">STAT</span>'];
            if (p.isHighAlert) tags.unshift('<span class="mdc-badge-warn">High Alert</span>');
            return [{
                name: p.drug,
                requiresWitness: p.isHighAlert || isHighAlertDrug(p.drug),
                nameHtml: p.drug + ' ' + tags.join(' '),
                scanSub: p.route + ' · ' + p.dose + (p.needWitness ? ' · ต้องมีพยาน' : '') + ' · สั่งเมื่อ ' + p.orderTime + ' น.',
                detail: p.route + ' · ' + p.dose,
                routeTh: p.routeTh,
                lot: p.lot,
                exp: p.expiry
            }];
        }

        if (flow === 'prn') {
            const p = getCurrentFlowPatient(flow);
            if (!p) return [];
            const tags = [];
            if (p.isHighAlert) tags.push('<span class="mdc-badge-warn">High Alert</span>');
            if (p.isNarcotic) tags.push('<span class="mdc-badge-warn" style="background:#faf5ff;color:#7c3aed;border-color:#c4b5fd;">ยาเสพติด</span>');
            return [{
                name: p.drug,
                requiresWitness: p.isHighAlert || isHighAlertDrug(p.drug),
                nameHtml: p.drug + (tags.length ? ' ' + tags.join(' ') : ''),
                scanSub: p.route + ' · ' + p.dose + ' · ' + p.condition + (p.needWitness ? ' · ต้องมีพยาน' : ''),
                detail: p.route + ' · ' + p.dose,
                routeTh: p.routeTh,
                lot: p.lot,
                exp: p.expiry
            }];
        }

        if (flow === 'ha') {
            const p = getCurrentFlowPatient(flow);
            if (!p) return [];
            return [{
                name: p.drug,
                requiresWitness: true,
                nameHtml: p.drug + ' <span class="mdc-badge-warn">High Alert</span>',
                scanSub: p.route + ' · ' + p.dose + ' · OD · ' + p.dueTime + ' · ต้องมีพยาน · Double Check',
                detail: p.detail,
                routeTh: p.routeTh,
                lot: p.lot,
                exp: p.expiry
            }];
        }

        if (flow === 'ov') {
            const p = getCurrentFlowPatient(flow);
            if (!p) return [];
            const tags = ['<span class="mdc-badge-warn" style="background:#fff1f2;color:#be123c;border-color:#fda4af;">' + p.overdueScanTag + '</span>'];
            if (p.isHighAlert) tags.unshift('<span class="mdc-badge-warn">High Alert</span>');
            return [{
                name: p.drug,
                requiresWitness: p.isHighAlert || isHighAlertDrug(p.drug),
                nameHtml: p.drug + ' ' + tags.join(' '),
                scanSub: p.route + ' · ' + p.dose + ' · ควรให้ ' + p.dueTime + ' · ' + p.overdueSummary,
                detail: p.detail,
                routeTh: p.routeTh,
                lot: p.lot,
                exp: p.expiry
            }];
        }

        return [];
    }

    function getFlowDrugText(flow) {
        return getCurrentFlowDrugs(flow).map(function(d) { return d.name; }).join(' · ');
    }

    function updateFlowConfirmButton(flow, count) {
        const btn = document.getElementById(multiDrugConfirmMap[flow]);
        if (!btn) return;
        btn.disabled = true;
        const template = flowConfirmButtonTemplates[flow];
        if (template) btn.innerHTML = template.replace('%COUNT%', count + '/' + count);
    }

    function multiDrugFlowAccent(flow) {
        const map = {
            r:  { bar:'#0d9488', btn:'linear-gradient(135deg,#0d9488,#14b8a6)' },
            st: { bar:'#dc2626', btn:'linear-gradient(135deg,#b91c1c,#dc2626)' },
            prn:{ bar:'#7c3aed', btn:'linear-gradient(135deg,#6d28d9,#7c3aed)' },
            ha: { bar:'#d97706', btn:'linear-gradient(135deg,#b45309,#d97706)' },
            ov: { bar:'#be123c', btn:'linear-gradient(135deg,#9f1239,#be123c)' }
        };
        return map[flow] || map.r;
    }

    function multiDrugCardHtml(flow, idx) {
        const accent = multiDrugFlowAccent(flow);
        const id = flow + 'drug_' + idx;
        const rights = ['Patient','Drug','Dose','Route','Time'].map(function(label) {
            return '<div class="rt-r pass" style="font-size:9px;padding:3px 2px;">' + label + '</div>';
        }).join('');
        return '<div class="mdc" id="' + id + '" data-flow="' + flow + '" data-done="false">'
            + '<div class="mdc-bar" style="background:' + accent.bar + ';"></div>'
            + '<div class="mdc-body">'
            + '<div class="mdc-header">'
            + '<div class="mdc-info"><div class="mdc-name">—</div><div class="mdc-sub">—</div></div>'
            + '<button class="mdc-btn" id="' + id + '_btn" style="background:' + accent.btn + ';" onclick="scanMultiDrug(\'' + flow + '\',' + idx + ')">' + scanButtonHtml + '</button>'
            + '</div>'
            + '<div class="mdc-done-row" id="' + id + '_done" style="display:none;">'
            + '<div class="mdc-rights">' + rights + '</div>'
            + '<span class="mdc-result-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="#166534"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span id="' + id + '_resname">—</span></span>'
            + '<span style="font-size:11px;color:var(--text-2);" id="' + id + '_lot">—</span>'
            + '</div></div></div>';
    }

    function ensureMultiDrugCards(flow, count) {
        let cards = Array.from(document.querySelectorAll('.mdc[data-flow="' + flow + '"]'));
        if (!cards.length) return cards;
        const container = cards[0].parentElement;
        while (cards.length < count) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = multiDrugCardHtml(flow, cards.length);
            const card = wrapper.firstElementChild;
            container.appendChild(card);
            cards.push(card);
        }
        return cards;
    }

    function syncMultiDrugCards(flow, items) {
        const cards = ensureMultiDrugCards(flow, items.length);
        cards.forEach(function(card, idx) {
            const item = items[idx];
            const btn = document.getElementById(flow + 'drug_' + idx + '_btn');
            const doneRow = document.getElementById(flow + 'drug_' + idx + '_done');
            const resultName = document.getElementById(flow + 'drug_' + idx + '_resname');
            const lotEl = document.getElementById(flow + 'drug_' + idx + '_lot');
            if (!item) {
                card.style.display = 'none';
                card.dataset.done = 'true';
                if (doneRow) doneRow.style.display = 'none';
                return;
            }
            card.style.display = '';
            card.dataset.done = 'false';
            card.classList.remove('done');
            if (btn) {
                btn.disabled = false;
                btn.style.display = '';
                btn.innerHTML = scanButtonHtml;
            }
            if (doneRow) doneRow.style.display = 'none';
            if (resultName) resultName.textContent = item.name;
            if (lotEl) lotEl.textContent = '';
            const nameEl = card.querySelector('.mdc-name');
            if (nameEl) nameEl.innerHTML = item.nameHtml || item.name;
            const subEl = card.querySelector('.mdc-sub');
            if (subEl) subEl.textContent = item.scanSub || '';
        });
        updateFlowConfirmButton(flow, items.length);
    }

    function getCurrentFlowGivenTime(flow) {
        const timeIdMap = { st:'stGivenTime', prn:'prnGivenTime', ha:'haGivenTime', ov:'ovGivenTime' };
        if (flow === 'r') return new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) + ' น.';
        const el = document.getElementById(timeIdMap[flow]);
        if (el && el.textContent && el.textContent.trim()) return el.textContent.trim();
        return new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) + ' น.';
    }

    function goCurrentPostAssessI(flow) {
        if (!canAccessAssessment()) {
            showAssessmentAccessDenied();
            return;
        }
        const patient = getCurrentFlowPatient(flow);
        if (!patient) return;
        const drugs = getCurrentFlowDrugs(flow);
        const drugText = flow === 'r' ? getFlowDrugText(flow) : ((drugs[0] && drugs[0].name) || patient.drug || '');
        const detailText = (drugs[0] && drugs[0].detail) || patient.detail || [patient.route, patient.dose].filter(Boolean).join(' · ');
        const typeMap = { r:'Routine', st:'STAT', prn:'PRN', ha:'High Alert', ov:'Overdue' };
        const originMap = { r:'pg-routine', st:'pg-stat', prn:'pg-prn', ha:'pg-highalert', ov:'pg-overdue' };
        goPostAssessI({
            patient: patient.name,
            bed: patient.hn + ' · ' + patient.bed,
            drug: drugText,
            detail: detailText,
            type: typeMap[flow] || '',
            givenTime: getCurrentFlowGivenTime(flow),
            showPain: flow === 'prn',
            origin: originMap[flow] || 'pg-dashboard'
        });
    }

    function getAlreadyScannedMultiDrugNames(flow, idx, currentItems) {
        return [...document.querySelectorAll(`.mdc[data-flow="${flow}"]`)]
            .filter(card => card.style.display !== 'none' && card.dataset.done === 'true')
            .map(function(card) {
                const cardIdx = parseInt(String(card.id || '').replace(`${flow}drug_`, ''), 10);
                if (!Number.isFinite(cardIdx) || cardIdx === idx) return '';
                return currentItems[cardIdx] ? currentItems[cardIdx].name : '';
            })
            .filter(Boolean);
    }

    function scanMultiDrug(flow, idx, simulateFail) {
        const currentItems = getCurrentFlowDrugs(flow);
        const data = currentItems[idx];
        const btn = document.getElementById(`${flow}drug_${idx}_btn`);
        if (!btn) return;

        // ── 7 Rights FAIL demo ──
        if (simulateFail) {
            btn.disabled = true;
            btn.innerHTML = '...กำลังสแกน...';
            setTimeout(function() {
                var card = document.getElementById(`${flow}drug_${idx}`);
                if (!card) return;
                card.classList.add('fail');
                card.dataset.rightsFail = 'true';
                card.style.borderColor = '#FECACA';
                card.style.background = '#FEF2F2';
                var doneRow = document.getElementById(`${flow}drug_${idx}_done`);
                if (doneRow) {
                    doneRow.style.display = '';
                    doneRow.innerHTML =
                        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">'
                        + '<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Patient</div>'
                        + '<div class="rt-r" style="font-size:9px;padding:3px 6px;background:#FEE2E2;color:#DC2626;border-color:#FECACA;font-weight:900;">Drug ✗</div>'
                        + '<div class="rt-r" style="font-size:9px;padding:3px 6px;background:#FEE2E2;color:#DC2626;border-color:#FECACA;font-weight:900;">Dose ✗</div>'
                        + '<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Route</div>'
                        + '<div class="rt-r pass" style="font-size:9px;padding:3px 6px;">Time</div>'
                        + '</div>'
                        + '<div style="display:flex;align-items:center;gap:8px;color:#DC2626;font-weight:800;font-size:12px;">'
                        + '<svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
                        + ' ยาไม่ตรงคำสั่งแพทย์ — สแกนได้ Paracetamol 500mg แทน Omeprazole 20mg'
                        + '</div>';
                }
                // Hide both buttons in the container
                var btnContainer = btn.parentElement;
                if (btnContainer) btnContainer.style.display = 'none';
                showToast('7 Rights ไม่ผ่าน — ยาไม่ตรงกับคำสั่งแพทย์');
                checkMultiDrugDone(flow);
            }, 1200);
            return;
        }

        // ── Normal scan flow ──
        function continueMultiDrugScan() {
            if (data && data.requiresWitness && flow !== 'ha') {
                showHAVerifyModal(data.name, data.lot || 'N/A', function() {
                    showToast('พยานยืนยัน High Alert สำเร็จ — ' + data.name);
                    setTimeout(function(){ showToast(''); }, 2000);
                    completeMultiDrugScan(flow, idx, data);
                }, 'witness');
                return;
            }
            completeMultiDrugScan(flow, idx, data);
        }

        const alreadyScanned = getAlreadyScannedMultiDrugNames(flow, idx, currentItems);
        if (data && alreadyScanned.length) {
            const interaction = checkDrugInteraction(data.name, alreadyScanned);
            if (interaction.found) {
                showInteractionModal(interaction, continueMultiDrugScan);
                return;
            }
        }
        continueMultiDrugScan();
    }

    function completeMultiDrugScan(flow, idx, data) {
        const btn = document.getElementById(`${flow}drug_${idx}_btn`);
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = '...กำลังสแกน...';
        setTimeout(() => {
            const card = document.getElementById(`${flow}drug_${idx}`);
            if (!card) return;
            card.classList.add('done');
            card.dataset.done = 'true';
            document.getElementById(`${flow}drug_${idx}_done`).style.display = '';
            if (data) {
                document.getElementById(`${flow}drug_${idx}_lot`).textContent = `Lot: ${data.lot} · Exp: ${data.exp}`;
                document.getElementById(`${flow}drug_${idx}_resname`).textContent = data.name;
            }
            btn.style.display = 'none';
            checkMultiDrugDone(flow);
        }, 1200);
    }

    function checkMultiDrugDone(flow) {
        const cards = [...document.querySelectorAll(`.mdc[data-flow="${flow}"]`)].filter(c => c.style.display !== 'none');
        if (!cards.length) return;
        const total = cards.length;
        const doneCount = cards.filter(c => c.dataset.done === 'true').length;
        const failedCount = cards.filter(c => c.dataset.rightsFail === 'true').length;
        const confirmId = multiDrugConfirmMap[flow];
        if (!confirmId) return;
        const btn = document.getElementById(confirmId);
        if (!btn) return;

        // If any drug failed 7 Rights → block completely
        if (failedCount > 0) {
            btn.disabled = true;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> 7 Rights ไม่ผ่าน — ห้ามให้ยา';
            btn.style.background = 'linear-gradient(135deg,#DC2626,#EF4444)';
            return;
        }

        // At least 1 scanned → enable button (partial OK)
        if (doneCount > 0) {
            btn.disabled = false;
            if (doneCount < total) {
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> ยืนยันให้ยา (' + doneCount + '/' + total + ') — มียาที่ยังไม่ได้สแกน';
                btn.style.background = 'linear-gradient(135deg,#D97706,#F59E0B)';
            } else {
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ยืนยันให้ยา (' + total + '/' + total + ')';
                btn.style.background = 'linear-gradient(135deg,#0D9488,#14B8A6)';
            }
        } else {
            btn.disabled = true;
        }
    }

    function getCurrentWardInfo() {
        return wardInfo[currentWardName] || wardInfo[DEFAULT_DEMO_WARD] || wardInfo['Ward 3A'];
    }

    function wardShortName(wardName) {
        return String(wardName || DEFAULT_DEMO_WARD).replace(/^Ward\s+/,'');
    }

    function setAllTextById(id, value) {
        document.querySelectorAll('[id="' + id + '"]').forEach(function(el) {
            el.textContent = value;
        });
    }

    function updateWardChrome(wardName) {
        const info = wardInfo[wardName] || wardInfo[DEFAULT_DEMO_WARD] || wardInfo['Ward 3A'];
        const shortWard = wardShortName(wardName);
        const cartId = (info.cart || 'Med Cart A-1').replace(/^Med Cart\s+/,'');
        setAllTextById('loginWardLabel', wardName);
        setAllTextById('ghWard', wardName);
        setAllTextById('prepWardHeader', wardName);
        setAllTextById('prepWardCtx', wardName);
        setAllTextById('hwWard', wardName);
        setAllTextById('dispWardHdr', wardName);
        setAllTextById('pbpWard', wardName);
        setAllTextById('pbmWard', wardName);
        setAllTextById('pbsWard', wardName);
        setAllTextById('fillWard', shortWard);
        setAllTextById('dispWardChip', shortWard);
        setAllTextById('loginCartBadge', cartId);
        setAllTextById('loginCartName', info.cart || 'Med Cart A-1');
        const cartCodeMatch = cartId.match(/^([A-Z]+)-(\d+)$/);
        const cartCode = cartCodeMatch ? ('MC-' + cartCodeMatch[1] + '-' + cartCodeMatch[2].padStart(3, '0')) : 'MC-' + cartId;
        setAllTextById('loginCartCode', cartCode);
        setAllTextById('loginCartVersion', cartId.startsWith('C-') ? 'v4.0.0' : cartId.startsWith('B-') ? 'v3.1.8' : 'v3.2.1');

        const bannerWard = document.querySelector('#dashBanner span[style*="letter-spacing"]');
        if (bannerWard) bannerWard.textContent = wardName + ' · ' + info.desc + ' · รอบเช้า 08:00 น.';
        const patientStatSub = document.getElementById('dashStatPatientsSub');
        if (patientStatSub) patientStatSub.textContent = wardName + ' ทั้งหมด';
        const cartChipId = document.querySelector('#dashBanner .db-cart-chip-id');
        if (cartChipId) cartChipId.textContent = cartId;
        const dashCartName = document.getElementById('dashCartName');
        if (dashCartName) dashCartName.textContent = info.cart || 'Med Cart A-1';
        renderDashboardCartCard();
        const loginCartName = document.querySelector('#pg-login #loginWardLabel')?.closest('[style*="display:flex"]')?.querySelector('[style*="font-size:12px"][style*="font-weight:600"]');
        if (loginCartName) loginCartName.textContent = info.cart || 'Med Cart A-1';
        const assessWardPill = document.querySelector('#pg-assess-list .status-pill');
        if (assessWardPill) assessWardPill.innerHTML = '<span class="dot"></span> ' + escHtml(wardName);
    }

    function replaceSharedPatientData(wardName) {
        const nextData = cloneWardData(wardPatientDataTemplates[wardName] || wardPatientDataTemplates[DEFAULT_DEMO_WARD] || wardPatientDataTemplates['Ward 3A']);
        Object.keys(patientData).forEach(function(key) { delete patientData[key]; });
        Object.assign(patientData, nextData);
        applyOrderPlanOrdersToPatientData(wardName || orderPlanWardName());
    }

    function routineDrugFromLegacy(drug, pt, idx) {
        const view = legacyDrugView(drug, pt, idx);
        return {
            name: view.name,
            dose: view.dose,
            route: view.routeFull,
            time: view.time === 'PRN' ? 'PRN' : view.time + ' น.',
            freq: view.freq
        };
    }

    function routinePatientFromLegacy(pt) {
        return {
            avatar: pt.avatar,
            name: pt.name,
            hn: pt.hn,
            bed: pt.bed,
            age: pt.age,
            allergy: pt.allergy,
            tags: cloneWardData(pt.tags || []),
            round: pt.round,
            drugs: getRoutineDispenseDrugs(pt).map(function(drug, idx) { return routineDrugFromLegacy(drug, pt, idx); })
        };
    }

    function agePartsForFlow(pt) {
        const gender = String(pt.age || '').split(',')[0].trim() || patientGenderFromName(pt.name);
        const ageMatch = String(pt.age || '').match(/\d+/);
        return { gender: gender, age: ageMatch ? parseInt(ageMatch[0], 10) : 0 };
    }

    function allergyForFlow(pt) {
        return pt.allergy ? pt.allergy.replace(/^แพ้ยา:\s*/,'') : '-';
    }

    function collectWardDrugMatches(limit, primaryPredicate, fallbackPredicate) {
        const rows = [];
        const seen = new Set();
        function addMatches(predicate) {
            getDispensePatientKeys().forEach(function(key) {
                const pt = patientData[key];
                (pt.drugs || []).forEach(function(drug, idx) {
                    if (rows.length >= limit) return;
                    const view = legacyDrugView(drug, pt, idx);
                    const matchKey = key + ':' + idx;
                    if (!seen.has(matchKey) && predicate(view, drug, pt, key)) {
                        rows.push({ key:key, pt:pt, drug:drug, idx:idx, view:view });
                        seen.add(matchKey);
                    }
                });
            });
        }
        addMatches(primaryPredicate);
        if (fallbackPredicate && rows.length < limit) addMatches(fallbackPredicate);
        return rows.slice(0, limit);
    }

    function flowPatientFromMatch(match, flow, idx) {
        const pt = match.pt;
        const view = match.view;
        const age = agePartsForFlow(pt);
        const base = {
            name: pt.name,
            initials: pt.avatar || patientInitials(pt.name),
            hn: pt.hn,
            bed: pt.bed,
            gender: age.gender,
            age: age.age,
            allergy: allergyForFlow(pt),
            drug: view.name,
            drugShort: view.name,
            drugFull: view.name,
            dose: view.dose,
            route: view.routeShort,
            routeTh: view.routeFull,
            routeDesc: view.routeFull.replace(/^[A-Z]+\s*/,'') || view.routeFull,
            detail: view.detail,
            lot: view.lot,
            expiry: view.exp,
            isHighAlert: view.highAlert,
            needWitness: view.highAlert
        };

        if (flow === 'st') {
            return Object.assign(base, {
                orderTime: idx === 0 ? '07:25' : '08:05',
                elapsedMin: idx === 0 ? 48 : 8,
                doctor: idx === 0 ? 'นพ.สุรศักดิ์' : 'พญ.นิภา',
                urgency: view.highAlert ? 'high' : 'moderate'
            });
        }
        if (flow === 'prn') {
            return Object.assign(base, {
                condition: view.isPrn ? view.freq : 'q4-6h PRN pain/fever',
                interval: 'q4-6h',
                intervalHrs: 4,
                lastGiven: idx === 0 ? '03:00' : idx === 1 ? '02:00' : '07:30',
                hrsAgo: idx === 2 ? 0.5 : idx === 1 ? 6 : 5,
                isNarcotic: false,
                canGive: idx !== 2,
                prnCount: 1
            });
        }
        if (flow === 'ha') {
            return Object.assign(base, {
                dueTime: idx === 0 ? '08:00 น.' : '07:30 น.'
            });
        }
        if (flow === 'ov') {
            const elapsed = idx === 0 ? '48 นาที' : '1 ชม. 18 นาที';
            return Object.assign(base, {
                dueTime: idx === 0 ? '07:30 น.' : '07:00 น.',
                overdueText: elapsed,
                overdueScanTag: 'Overdue ' + elapsed,
                overdueSummary: 'เลยเวลามา ' + elapsed
            });
        }
        return base;
    }

    function syncWardFlowDatasets() {
        applyOrderPlanOrdersToPatientData(orderPlanWardName());
        const keys = getRoutineDispensePatientKeys();
        const allKeys = getDispensePatientKeys();
        const firstKey = keys[0] || allKeys[0] || '01';

        Object.keys(dispensePatients).forEach(function(key) { delete dispensePatients[key]; });
        keys.forEach(function(key) {
            dispensePatients[key] = routinePatientFromLegacy(patientData[key]);
        });

        const statRows = collectWardDrugMatches(2, function(v) { return !v.done && !v.isPrn && v.highAlert; }, function(v) { return !v.done && !v.isPrn; });
        stPatients.splice(0, stPatients.length, ...statRows.map(function(row, idx) { return flowPatientFromMatch(row, 'st', idx); }));

        const prnRows = collectWardDrugMatches(Number.MAX_SAFE_INTEGER, function(v) { return !v.done && v.isPrn; }, null);
        prnPatients.splice(0, prnPatients.length, ...prnRows.map(function(row, idx) { return flowPatientFromMatch(row, 'prn', idx); }));

        const highAlertRows = collectWardDrugMatches(Number.MAX_SAFE_INTEGER, function(v) { return !v.done && !v.isPrn && v.highAlert; }, function(v) { return !v.isPrn && v.highAlert; });
        haPatients.splice(0, haPatients.length, ...highAlertRows.map(function(row, idx) { return flowPatientFromMatch(row, 'ha', idx); }));

        const overdueRows = collectWardDrugMatches(2, function(v) { return !v.done && !v.isPrn; }, function(v) { return !v.done && !v.isPrn; });
        ovPatients.splice(0, ovPatients.length, ...overdueRows.map(function(row, idx) { return flowPatientFromMatch(row, 'ov', idx); }));

        currentDispenseBed = dispensePatients[currentDispenseBed] ? currentDispenseBed : (keys[0] || '');
        currentLegacyDispenseBed = getRoutineDispenseDrugs(patientData[currentLegacyDispenseBed]).length ? currentLegacyDispenseBed : (keys[0] || firstKey);
        stSelectedIdx = 0;
        prnSelectedIdx = 0;
        haSelectedIdx = 0;
        ovSelectedIdx = 0;

        stRenderList();
        stSelectPt(0, false);
        prnRenderList();
        prnSelectPt(0, false);
        haRenderList();
        haSelectPt(0, false);
        omRenderList();
        omSelectPt(0, false);
        ovSelectPt(0, false);
        if (currentDispenseBed) rtSelectPatient(currentDispenseBed, false);
        renderRoutinePatientSelectionPage();
        setLegacyDispensePatient(currentLegacyDispenseBed || firstKey);
        renderDispenseList();
        renderPrepTypePage();
        renderPrepPatientPage();
        renderPrepMedicationPage();
        renderPrepSchedulePage();
        renderPrepScheduleDetail();
        renderDashboardDynamic();
        renderAssessmentListDynamic();
        if (typeof renderOrderPlanPage === 'function' && getActivePageId() === 'pg-order-plan') renderOrderPlanPage();
        if (typeof renderNurseSchedulePage === 'function' && getActivePageId() === 'pg-nurse-schedule') renderNurseSchedulePage();
        if (typeof renderEmarPage === 'function' && getActivePageId() === 'pg-emar') renderEmarPage();
    }

    function applyWardSelection(wardName, options) {
        options = options || {};
        const resolvedWard = wardInfo[wardName] ? wardName : DEFAULT_DEMO_WARD;
        const previousWard = currentWardName;
        currentWardName = resolvedWard;
        selectedWardName = resolvedWard;
        sessionStorage.setItem('mcWard', resolvedWard);
        if (previousWard && previousWard !== resolvedWard) resetCassetteModeLocks();
        updateWardChrome(resolvedWard);
        if (!wardDataReady) return;
        replaceSharedPatientData(resolvedWard);
        syncWardFlowDatasets();
        // Re-init central store for the new ward
        try { if (typeof MedCartStore !== 'undefined') MedCartStore.init(resolvedWard); } catch(e) { console.error('MedCartStore.init error:', e); }
        // Re-sync after init — add approved drugs to patientData then rebuild flow datasets
        try { syncApprovedDrugsToPatientData(); } catch(e) {}
        try { seedOrderPlanFromMedCartStore(); } catch(e) {}
        try { syncWardFlowDatasets(); } catch(e) {}
        if (!options.silent) {
            const info = getCurrentWardInfo();
            showToast('เปลี่ยนเป็น ' + resolvedWard + ' — โหลดข้อมูล ' + info.desc + ' แล้ว');
            setTimeout(function(){ showToast(''); }, 1800);
        }
    }

    function seedDemoOffCartRecords() {
        var existing = getEmarRecords();
        if (existing.some(function(r) { return r.offCart && r.id && r.id.indexOf('DEMO-OC') === 0; })) return;
        var today = new Date(); today.setHours(0,0,0,0);
        var ward = currentWardName || DEFAULT_DEMO_WARD;
        var demos = [
            { id:'DEMO-OC-001', ward:ward, offCart:true, patientKey:'08', patientName:'นางกัลยา ชัยวงศ์', hn:'6403012', bed:'3A-08',
              drugName:'Acetaminophen 500 mg', dose:'2 เม็ด', route:'PO', routeFull:'PO (รับประทาน)', schedule:'Off-cart',
              dueTime:'Off-cart', givenTime:'07:40 น.', source:'Ward stock', reason:'ผู้ป่วยปวดหัว ยาในรถเข็นหมด',
              highAlert:false, prn:false, recordedAt: new Date(today.getTime()+7*3600000).toISOString(), recordedBy:'นส.สมใจ ดีมาก' },
            { id:'DEMO-OC-002', ward:ward, offCart:true, patientKey:'01', patientName:'นายสมชาย มานะ', hn:'6401234', bed:'3A-01',
              drugName:'Ondansetron 4 mg', dose:'1 เม็ด', route:'PO', routeFull:'PO (รับประทาน)', schedule:'Off-cart',
              dueTime:'Off-cart', givenTime:'08:15 น.', source:'Ward stock', reason:'คลื่นไส้หลังรับยา Heparin',
              highAlert:false, prn:false, recordedAt: new Date(today.getTime()+8.25*3600000).toISOString(), recordedBy:'นส.สมใจ ดีมาก' }
        ];
        var combined = demos.concat(existing);
        saveEmarRecords(combined);
    }

    document.addEventListener('DOMContentLoaded', function() {
        wardDataReady = true;
        try { seedDemoOffCartRecords(); } catch(e) {}
        applyWardSelection(currentWardName || DEFAULT_DEMO_WARD, { silent: true });
    });

    /* ── Post-Medication Assessment (Index.html inline) ── */
    let postAssessOrigin = 'pg-dashboard';

    function goPostAssessI(meta) {
        if (!canAccessAssessment()) {
            showAssessmentAccessDenied();
            return;
        }
        meta = meta || {};
        postAssessOrigin = meta.origin || 'pg-dashboard';
        const form = document.getElementById('paFormI');
        const succ = document.getElementById('paSuccessI');
        if (form) form.style.display = '';
        if (succ) succ.style.display = 'none';
        ['paResBetterI','paResSameI','paResWorseI'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.style.background = '';
            el.style.borderColor = 'var(--border)';
            el.querySelectorAll('.pa-radio-fill').forEach(f => f.style.display = 'none');
        });
        document.querySelectorAll('#paAdrGroupI > div').forEach(d => { d.style.background=''; d.style.borderColor='var(--border)'; d.style.color='var(--text-2)'; d.dataset.active='0'; });
        document.querySelectorAll('#paPainScaleI .pain-dot').forEach(d => d.classList.remove('active'));
        const now = new Date();
        const timeEl = document.getElementById('paAssessTimeI');
        if (timeEl) timeEl.value = now.toTimeString().slice(0,5);
        if (meta.patient) { const e=document.getElementById('paPatientNameI'); if(e) e.textContent=meta.patient; }
        if (meta.bed)     { const e=document.getElementById('paPatientBedI');  if(e) e.textContent=meta.bed; }
        if (meta.drug)    { const e=document.getElementById('paDrugNameI');    if(e) e.textContent=meta.drug; const o=document.getElementById('paOkDrugI');     if(o) o.textContent=meta.drug; }
        if (meta.detail)  { const e=document.getElementById('paDrugDetailI'); if(e) e.textContent=meta.detail; }
        if (meta.type)    { const e=document.getElementById('paFlowLabelI');   if(e) e.textContent=meta.type; }
        if (meta.givenTime){ const e=document.getElementById('paGivenTimeI'); if(e) e.textContent=meta.givenTime; }
        if (meta.patient) { const o=document.getElementById('paOkPatientI');   if(o) o.textContent=meta.patient; }
        const pg = document.getElementById('paPainGroupI');
        if (pg) pg.style.display = meta.showPain ? '' : 'none';
        nav('pg-post-assess');
    }

    function postAssessBack() { nav(postAssessOrigin); }

    function savePostAssessI() {
        const timeEl = document.getElementById('paAssessTimeI');
        const timeStr = timeEl ? timeEl.value : '';
        const responseMap = { 'paResBetterI':'ดีขึ้น / อาการบรรเทา', 'paResSameI':'ไม่เปลี่ยนแปลง', 'paResWorseI':'แย่ลง / ต้องการการดูแล' };
        let respLabel = '—';
        for (const [id, label] of Object.entries(responseMap)) {
            const el = document.getElementById(id);
            if (el && el.style.background && el.style.background !== '') { respLabel = label; break; }
        }
        const okResp = document.getElementById('paOkResponseI');
        if (okResp) { okResp.textContent = respLabel; okResp.style.color = respLabel.includes('ดีขึ้น') ? 'var(--green)' : respLabel.includes('แย่ลง') ? '#dc2626' : '#d97706'; }
        const savedTime = document.getElementById('paSavedTimeI');
        if (savedTime) savedTime.textContent = timeStr ? timeStr + ' น.' : new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) + ' น.';
        document.getElementById('paFormI').style.display = 'none';
        document.getElementById('paSuccessI').style.display = '';
    }

    function paPickResponseI(el, type) {
        const colorMap = { better:'#22c55e', same:'#f59e0b', worse:'#ef4444' };
        const bgMap    = { better:'#f0fdf4', same:'#fffbeb', worse:'#fef2f2' };
        ['paResBetterI','paResSameI','paResWorseI'].forEach(id => {
            const e = document.getElementById(id);
            if (!e) return;
            e.style.background = '';
            e.style.borderColor = 'var(--border)';
            e.querySelectorAll('.pa-radio-fill').forEach(f => f.style.display = 'none');
        });
        el.style.background = bgMap[type] || '';
        el.style.borderColor = colorMap[type] || 'var(--border)';
        el.querySelectorAll('.pa-radio-fill').forEach(f => f.style.display = '');
    }

    function paToggleAdrI(el) {
        const active = el.dataset.active === '1';
        if (active) { el.dataset.active='0'; el.style.background=''; el.style.borderColor='var(--border)'; el.style.color='var(--text-2)'; }
        else { el.dataset.active='1'; el.style.background='#d1fae5'; el.style.borderColor='#059669'; el.style.color='#065f46'; }
    }

    function pickPainPostI(el, score) {
        document.querySelectorAll('#paPainScaleI .pain-dot').forEach(d => d.classList.remove('active'));
        el.classList.add('active');
    }

    /* ── Toast ── */
    function showToast(msg) {
        const t = document.getElementById('toast');
        if (!msg) { t.classList.remove('show'); return; }
        t.textContent = msg;
        t.classList.add('show');
    }

    /* ── Partial Scan Warning Modal ── */
    function showPartialScanModal(unscanned, total, onConfirm) {
        var overlay = document.getElementById('partialScanModal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'partialScanModal';
            overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:10060;background:rgba(15,23,42,0.5);backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:20px;';
            overlay.innerHTML = '<div id="partialScanModalCard" style="background:white;border-radius:20px;max-width:440px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.25);overflow:hidden;"></div>';
            document.body.appendChild(overlay);
        }
        var scanned = total - unscanned;
        var card = document.getElementById('partialScanModalCard');
        card.innerHTML =
            '<div style="background:linear-gradient(135deg,#D97706,#F59E0B);padding:20px 24px;color:white;">'
            + '<div style="display:flex;align-items:center;gap:14px;">'
            + '<div style="width:48px;height:48px;background:rgba(255,255,255,0.18);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
            + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            + '</div>'
            + '<div>'
            + '<div style="font-size:18px;font-weight:800;">มียาที่ยังไม่ได้สแกน</div>'
            + '<div style="font-size:12px;opacity:.8;margin-top:3px;">กรุณาตรวจสอบก่อนดำเนินการต่อ</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div style="padding:24px;">'
            + '<div style="display:flex;gap:12px;margin-bottom:20px;">'
            + '<div style="flex:1;background:#FEF3C7;border:1.5px solid #FDE68A;border-radius:12px;padding:14px;text-align:center;">'
            + '<div style="font-size:28px;font-weight:800;color:#D97706;">' + unscanned + '</div>'
            + '<div style="font-size:11px;color:#92400E;font-weight:700;margin-top:2px;">ยังไม่ได้สแกน</div>'
            + '</div>'
            + '<div style="flex:1;background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:12px;padding:14px;text-align:center;">'
            + '<div style="font-size:28px;font-weight:800;color:#16A34A;">' + scanned + '</div>'
            + '<div style="font-size:11px;color:#166534;font-weight:700;margin-top:2px;">สแกนแล้ว</div>'
            + '</div>'
            + '</div>'
            + '<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:12px 14px;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px;">'
            + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" style="flex-shrink:0;margin-top:1px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            + '<div style="font-size:12px;color:#92400E;line-height:1.6;">'
            + 'ยาที่ยังไม่ได้สแกนจะ <strong>ไม่ถูกบันทึกในระบบ</strong> ว่าได้ให้ยาแล้ว<br>'
            + 'ท่านสามารถดำเนินการต่อได้ แต่ต้องมั่นใจว่าตรวจสอบครบถ้วนแล้ว'
            + '</div>'
            + '</div>'
            + '<div style="display:flex;gap:10px;">'
            + '<button id="partialScanCancelBtn" style="flex:1;padding:12px;border:1.5px solid #E2E8F0;border-radius:12px;background:white;font-family:Prompt,sans-serif;font-size:13px;font-weight:700;color:#475569;cursor:pointer;">กลับไปสแกนต่อ</button>'
            + '<button id="partialScanConfirmBtn" style="flex:1;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#D97706,#F59E0B);font-family:Prompt,sans-serif;font-size:13px;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3);">ยืนยันดำเนินการต่อ</button>'
            + '</div>'
            + '</div>';

        overlay.style.display = 'flex';
        document.getElementById('partialScanCancelBtn').onclick = function() { overlay.style.display = 'none'; };
        document.getElementById('partialScanConfirmBtn').onclick = function() { overlay.style.display = 'none'; if (onConfirm) onConfirm(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.style.display = 'none'; };
    }

    /* ── Cart List & Selection ── */
    const cartList = [
        {
            id: 'A-1', name: 'Med Cart A-1', code: 'MC-A-001', building: 'หอผู้ป่วย ตึก A', model: 'OmniRx Pro X2',
            serial: 'SN-20240315-001', sw: 'v3.2.1',
            status: 'ready', statusText: 'พร้อมใช้งาน', statusClass: 'online',
            ward: 'Ward 3A', wardNote: 'หอผู้ป่วยอายุรกรรม',
            lastUsed: 'วันนี้ 08:42', lastUser: 'นส.สมใจ ดีมาก',
            battery: 85, battNote: 'กำลังชาร์จ',
            drawers: 6, cassettes: 36, cassettesReady: 36,
            connection: 'Wi-Fi', signal: '−52 dBm · สัญญาณแรง', ip: '192.168.10.45', mac: 'A4:C3:F0:12:34:56'
        },
        {
            id: 'A-2', name: 'Med Cart A-2', code: 'MC-A-002', building: 'หอผู้ป่วย ตึก A', model: 'OmniRx Pro X2',
            serial: 'SN-20240315-002', sw: 'v3.2.1',
            status: 'ready', statusText: 'พร้อมใช้งาน', statusClass: 'online',
            ward: 'Ward 3B', wardNote: 'หอผู้ป่วยศัลยกรรม',
            lastUsed: 'วันนี้ 07:30', lastUser: 'นส.ปราณี รักดี',
            battery: 62, battNote: 'ใช้งานปกติ',
            drawers: 6, cassettes: 36, cassettesReady: 36,
            connection: 'Wi-Fi', signal: '−48 dBm · สัญญาณแรง', ip: '192.168.10.46', mac: 'A4:C3:F0:12:34:57'
        },
        {
            id: 'B-1', name: 'Med Cart B-1', code: 'MC-B-001', building: 'หอผู้ป่วย ตึก B', model: 'OmniRx Lite',
            serial: 'SN-20240420-003', sw: 'v3.1.8',
            status: 'ready', statusText: 'พร้อมใช้งาน', statusClass: 'online',
            ward: 'Ward 4A', wardNote: 'หอผู้ป่วยกุมารเวช',
            lastUsed: 'เมื่อวาน 20:15', lastUser: 'นส.วรรณา สุขสม',
            battery: 100, battNote: 'ชาร์จเต็ม',
            drawers: 6, cassettes: 36, cassettesReady: 36,
            connection: 'Wi-Fi', signal: '−60 dBm · สัญญาณปานกลาง', ip: '192.168.10.50', mac: 'B2:D1:E8:45:67:89'
        },
        {
            id: 'B-2', name: 'Med Cart B-2', code: 'MC-B-002', building: 'หอผู้ป่วย ตึก B', model: 'OmniRx Lite',
            serial: 'SN-20240420-004', sw: 'v3.1.8',
            status: 'maintenance', statusText: 'อยู่ระหว่างซ่อมบำรุง', statusClass: 'maintenance',
            ward: 'Ward 4B', wardNote: 'หอผู้ป่วยสูติ-นรีเวช',
            lastUsed: '28 มี.ค. 14:00', lastUser: 'นส.จันทร์เพ็ญ ศรีสุข',
            battery: 30, battNote: 'แบตเตอรี่ต่ำ',
            drawers: 6, cassettes: 36, cassettesReady: 36,
            connection: 'Offline', signal: 'ไม่มีสัญญาณ', ip: '—', mac: 'B2:D1:E8:45:67:8A'
        },
        {
            id: 'C-1', name: 'Med Cart C-1', code: 'MC-C-001', building: 'หอผู้ป่วย ตึก C', model: 'OmniRx Pro X3',
            serial: 'SN-20250110-005', sw: 'v4.0.0',
            status: 'ready', statusText: 'พร้อมใช้งาน', statusClass: 'online',
            ward: 'Ward 5A', wardNote: 'หอผู้ป่วยออร์โธปิดิกส์',
            lastUsed: 'วันนี้ 09:10', lastUser: 'พว.กานต์ ปัญญาดี',
            battery: 95, battNote: 'กำลังชาร์จ',
            drawers: 6, cassettes: 36, cassettesReady: 36,
            connection: 'Wi-Fi', signal: '−40 dBm · สัญญาณแรงมาก', ip: '192.168.10.60', mac: 'C6:A2:B3:78:90:AB'
        }
    ];

    const CART_FULL_RUNTIME_MIN = 8 * 60;

    function formatBatteryRuntime(minutes) {
        minutes = Math.max(Math.round(minutes || 0), 0);
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs <= 0 && mins <= 0) return 'ควรชาร์จทันที';
        if (hrs <= 0) return mins + ' นาที';
        if (mins === 0) return hrs + ' ชม.';
        return hrs + ' ชม. ' + mins + ' นาที';
    }

    function batteryRuntimeText(cart) {
        const battery = Math.max(Math.min(parseInt(cart && cart.battery, 10) || 0, 100), 0);
        if (battery <= 0) return 'ควรชาร์จทันที';
        return 'ใช้งานได้ประมาณ ' + formatBatteryRuntime((battery / 100) * CART_FULL_RUNTIME_MIN);
    }

    function batteryStatusNote(cart) {
        const note = (cart && cart.battNote) || 'ใช้งานปกติ';
        return note + ' · ' + batteryRuntimeText(cart);
    }

    function cartEnvAvg(rows, key) {
        if (!rows || !rows.length) return 0;
        return rows.reduce(function(sum, row) { return sum + (parseFloat(row[key]) || 0); }, 0) / rows.length;
    }

    function cartEnvRange(rows, key, formatter) {
        const vals = (rows || []).map(function(row) { return parseFloat(row[key]) || 0; });
        if (!vals.length) return '—';
        const min = Math.min.apply(null, vals);
        const max = Math.max.apply(null, vals);
        return formatter(min) + '-' + formatter(max);
    }

    function formatCartTemp(value) {
        return (parseFloat(value) || 0).toFixed(1) + '°C';
    }

    function formatCartHumidity(value) {
        return Math.round(parseFloat(value) || 0) + '% RH';
    }

    function setCartEnvTableExpanded(scope, expanded) {
        const wrap = document.getElementById(scope === 'drawer' ? 'drawerEnvTableWrap' : 'cartEnvTableWrap');
        const btn = document.getElementById(scope === 'drawer' ? 'drawerEnvToggle' : 'cartEnvToggle');
        if (wrap) wrap.classList.toggle('is-collapsed', !expanded);
        if (btn) {
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            const label = btn.querySelector('span');
            if (label) label.textContent = expanded ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด';
        }
    }

    function toggleCartEnvTable(scope) {
        const wrap = document.getElementById(scope === 'drawer' ? 'drawerEnvTableWrap' : 'cartEnvTableWrap');
        const nextExpanded = wrap ? wrap.classList.contains('is-collapsed') : true;
        setCartEnvTableExpanded(scope, nextExpanded);
    }

    function getCartEnvironmentProfile(cart) {
        cart = cart || cartList[0] || {};
        const drawerCount = Math.max(parseInt(cart.drawers, 10) || STANDARD_CART_DRAWERS, 1);
        const cassetteTotal = Math.max(parseInt(cart.cassettes, 10) || STANDARD_CART_CASSETTES, drawerCount);
        const perDrawer = Math.max(Math.ceil(cassetteTotal / drawerCount), 1);
        const seed = String(cart.id || 'A-1').split('').reduce(function(sum, ch) { return sum + ch.charCodeAt(0); }, 0);
        const needsCheck = cart.status === 'maintenance' || cart.connection === 'Offline';
        const baseTemp = needsCheck ? 26.7 : 23.6 + ((seed % 5) * 0.15);
        const baseHum = needsCheck ? 58 : 45 + (seed % 6);
        const drawers = Array.from({ length: drawerCount }, function(_, idx) {
            const drawerNo = idx + 1;
            const temp = baseTemp + (((drawerNo % 3) - 1) * 0.35) + (needsCheck && drawerNo >= drawerCount - 1 ? 1.2 : 0);
            const hum = baseHum + (((drawerNo % 4) - 1) * 1.3) + (needsCheck && drawerNo >= drawerCount - 1 ? 4 : 0);
            const cassetteTemp = temp + 0.25 + ((drawerNo % 2) * 0.15);
            const cassetteHum = hum + 1.2 + ((drawerNo % 3) * 0.5);
            const warn = temp > 26 || hum > 60 || cassetteTemp > 26.5 || cassetteHum > 62;
            return {
                drawer: drawerNo,
                cassettes: Math.min(perDrawer, Math.max(cassetteTotal - (idx * perDrawer), 0)),
                temp: temp,
                hum: hum,
                cassetteTemp: cassetteTemp,
                cassetteHum: cassetteHum,
                warn: warn
            };
        });
        const warnCount = drawers.filter(function(row) { return row.warn; }).length;
        return {
            status: warnCount ? 'warn' : 'ok',
            statusText: warnCount ? 'ควรตรวจสอบ' : 'ปกติ',
            drawerAvgTemp: cartEnvAvg(drawers, 'temp'),
            drawerAvgHum: cartEnvAvg(drawers, 'hum'),
            cassetteAvgTemp: cartEnvAvg(drawers, 'cassetteTemp'),
            cassetteAvgHum: cartEnvAvg(drawers, 'cassetteHum'),
            cassetteTempRange: cartEnvRange(drawers, 'cassetteTemp', formatCartTemp),
            cassetteHumRange: cartEnvRange(drawers, 'cassetteHum', formatCartHumidity),
            drawers: drawers,
            warnCount: warnCount
        };
    }

    function renderCartEnvironment(cart) {
        const profile = getCartEnvironmentProfile(cart);
        const statusEl = document.getElementById('cartEnvStatus');
        if (statusEl) {
            statusEl.classList.toggle('warn', profile.status === 'warn');
            statusEl.innerHTML = '<span class="dot"></span> ' + profile.statusText;
        }
        const updated = document.getElementById('cartEnvUpdated');
        if (updated) updated.textContent = 'อัปเดตล่าสุด ' + ((cart && cart.lastUsed) || 'วันนี้');
        const drawerTemp = document.getElementById('cartDrawerTemp');
        if (drawerTemp) drawerTemp.textContent = formatCartTemp(profile.drawerAvgTemp);
        const drawerHum = document.getElementById('cartDrawerHum');
        if (drawerHum) drawerHum.textContent = 'ความชื้น ' + formatCartHumidity(profile.drawerAvgHum);
        const cassTemp = document.getElementById('cartCassetteTemp');
        if (cassTemp) cassTemp.textContent = formatCartTemp(profile.cassetteAvgTemp);
        const cassHum = document.getElementById('cartCassetteHum');
        if (cassHum) cassHum.textContent = 'ความชื้น ' + formatCartHumidity(profile.cassetteAvgHum) + ' · ' + ((cart && cart.cassettes) || STANDARD_CART_CASSETTES) + ' ช่อง';
        const tableRows = profile.drawers.map(function(row) {
            return '<tr class="' + (row.warn ? 'warn' : '') + '">'
                + '<td><div class="drawer-name">D' + row.drawer + '</div><div class="metric-sub">' + row.cassettes + ' Cassette</div></td>'
                + '<td><div class="metric-main">' + formatCartTemp(row.temp) + '</div></td>'
                + '<td><div class="metric-main">' + formatCartHumidity(row.hum) + '</div></td>'
                + '<td><div class="metric-main">' + formatCartTemp(row.cassetteTemp) + '</div></td>'
                + '<td><div class="metric-main">' + formatCartHumidity(row.cassetteHum) + '</div></td>'
                + '<td><span class="cart-env-status ' + (row.warn ? 'warn' : '') + '">' + (row.warn ? 'ตรวจสอบ' : 'ปกติ') + '</span></td>'
                + '</tr>';
        }).join('');
        ['cartEnvTableBody','drawerEnvTableBody'].forEach(function(id) {
            const body = document.getElementById(id);
            if (body) body.innerHTML = tableRows;
        });
        const drawerEnvStatus = document.getElementById('drawerEnvStatus');
        if (drawerEnvStatus) {
            drawerEnvStatus.textContent = profile.statusText + (profile.warnCount ? ' · ' + profile.warnCount + ' Drawer' : '');
            drawerEnvStatus.style.color = profile.status === 'warn' ? '#D97706' : 'var(--green)';
        }
        const drawerEnvDrawerAvg = document.getElementById('drawerEnvDrawerAvg');
        if (drawerEnvDrawerAvg) drawerEnvDrawerAvg.textContent = formatCartTemp(profile.drawerAvgTemp) + ' · ' + formatCartHumidity(profile.drawerAvgHum);
        const drawerEnvCassetteAvg = document.getElementById('drawerEnvCassetteAvg');
        if (drawerEnvCassetteAvg) drawerEnvCassetteAvg.textContent = formatCartTemp(profile.cassetteAvgTemp) + ' · ' + formatCartHumidity(profile.cassetteAvgHum);
        const drawerEnvCassetteRange = document.getElementById('drawerEnvCassetteRange');
        if (drawerEnvCassetteRange) drawerEnvCassetteRange.textContent = profile.cassetteTempRange + ' · ' + profile.cassetteHumRange;
        return profile;
    }

    function renderCartListPage() {
        const grid = document.getElementById('cartListGrid');
        if (!grid) return;
        grid.innerHTML = cartList.map((c, i) => {
            const isMaint = c.status === 'maintenance';
            const battColor = c.battery > 60 ? '#0D9488' : c.battery > 25 ? '#D97706' : '#EF4444';
            const runtimeText = batteryRuntimeText(c);
            const env = getCartEnvironmentProfile(c);
            const envColor = env.status === 'warn' ? '#D97706' : '#0D9488';
            const connColor = c.connection === 'Offline' ? '#94A3B8' : '#2563EB';
            const connDot = c.connection === 'Offline' ? '#CBD5E1' : '#22C55E';
            return `
            <div class="cl-card ${isMaint ? 'maint' : ''}">
                <div class="cl-card-head">
                    <div class="cl-card-badge">${c.id}</div>
                    <div style="flex:1;min-width:0;">
                        <div class="cl-card-title">${c.name}</div>
                        <div class="cl-card-sub">${c.code} · ${c.model}</div>
                    </div>
                    <div class="cl-card-pill ${c.statusClass}">
                        <span class="dot"></span>
                        ${c.statusText}
                    </div>
                </div>
                <div class="cl-card-body">
                    <div>
                        <div class="cl-card-field-label">Ward</div>
                        <div class="cl-card-field-val">${c.ward}</div>
                        <div class="cl-card-field-note">${c.wardNote}</div>
                    </div>
                    <div>
                        <div class="cl-card-field-label">แบตเตอรี่</div>
                        <div class="cl-card-field-val" style="color:${battColor};">${c.battery}%
                            <span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:4px;">${c.battNote}</span>
                        </div>
                        <div class="cl-batt-bar"><div class="cl-batt-fill" style="width:${c.battery}%;background:${battColor};"></div></div>
                        <div class="cl-card-field-note">${runtimeText}</div>
                    </div>
                    <div>
                        <div class="cl-card-field-label">Temp / Humidity</div>
                        <div class="cl-card-field-val" style="color:${envColor};">${formatCartTemp(env.drawerAvgTemp)} · ${formatCartHumidity(env.drawerAvgHum)}</div>
                        <div class="cl-card-field-note">Cassette ${formatCartTemp(env.cassetteAvgTemp)} · ${formatCartHumidity(env.cassetteAvgHum)}</div>
                    </div>
                    <div>
                        <div class="cl-card-field-label">Drawer / Cassette</div>
                        <div class="cl-card-field-val">${c.drawers} ลิ้นชัก · ${c.cassettesReady}/${c.cassettes} ช่อง</div>
                    </div>
                    <div>
                        <div class="cl-card-field-label">การเชื่อมต่อ</div>
                        <div class="cl-card-field-val">
                            <span class="cl-conn-dot" style="background:${connDot};"></span>
                            <span style="color:${connColor};">${c.connection}</span>
                        </div>
                    </div>
                </div>
                <div class="cl-card-footer">
                    <div class="cl-card-footer-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <span class="cl-card-footer-text">${c.lastUsed} · ${c.lastUser}</span>
                </div>
            </div>`;
        }).join('');
    }

    function openCartDetail(idx) {
        const c = cartList[idx];

        // Update hero info
        document.getElementById('cartBadge').textContent = c.id;
        document.getElementById('cartTitle').textContent = c.name;
        document.getElementById('cartSub').innerHTML = 'รหัส: ' + c.code + ' &nbsp;·&nbsp; ' + c.building + ' &nbsp;·&nbsp; ' + c.model;

        // Status
        const statusEl = document.getElementById('cartStatusLg');
        statusEl.className = 'p1-status-lg ' + (c.status === 'ready' ? 'ready' : '');
        if (c.status === 'maintenance') {
            statusEl.style.background = '#FFFBEB';
            statusEl.style.color = '#D97706';
            statusEl.style.borderColor = '#FDE68A';
        } else {
            statusEl.style.background = '';
            statusEl.style.color = '';
            statusEl.style.borderColor = '';
        }
        document.getElementById('cartStatusText').textContent = c.statusText;

        // Stats
        document.getElementById('cartWard').textContent = c.ward;
        document.getElementById('cartWardNote').textContent = c.wardNote;
        document.getElementById('cartLastUsed').textContent = c.lastUsed;
        document.getElementById('cartLastUser').textContent = c.lastUser;
        document.getElementById('cartBattFill').style.width = c.battery + '%';
        document.getElementById('cartBattVal').textContent = c.battery + '%';
        document.getElementById('cartBattNote').textContent = batteryStatusNote(c);
        renderCartEnvironment(c);
        document.getElementById('cartDrawers').innerHTML = c.drawers + ' <span style="font-size:13px;color:var(--text-2);font-weight:400;">ลิ้นชัก</span>';
        document.getElementById('cartCassettes').innerHTML = c.cassettesReady + ' <span style="font-size:13px;color:var(--text-2);font-weight:400;">/ ' + c.cassettes + ' ช่อง</span>';
        document.getElementById('cartConnection').textContent = c.connection;
        document.getElementById('cartConnection').style.color = c.connection === 'Offline' ? 'var(--text-3)' : '#2563eb';
        document.getElementById('cartSignal').textContent = c.signal;

        // Update drawer detail panel
        const dRows = document.querySelectorAll('#drawer .d-section');
        if (dRows.length >= 2) {
            const generalVals = dRows[0].querySelectorAll('.d-val');
            if (generalVals.length >= 6) {
                generalVals[0].textContent = c.code;
                generalVals[1].textContent = c.name;
                generalVals[2].textContent = c.model;
                generalVals[3].textContent = c.serial;
                generalVals[4].textContent = c.sw;
                generalVals[5].textContent = c.statusText;
                generalVals[5].style.color = c.status === 'ready' ? 'var(--green)' : '#D97706';
            }
            const hwVals = dRows[1].querySelectorAll('.d-val');
            if (hwVals.length >= 7) {
                hwVals[0].textContent = c.drawers + ' ลิ้นชัก';
                hwVals[1].textContent = c.cassettes + ' ช่อง';
                hwVals[2].textContent = c.cassettesReady + ' ช่อง';
                hwVals[2].style.color = c.cassettesReady === c.cassettes ? 'var(--green)' : '#D97706';
                hwVals[3].textContent = c.battery + '% (' + batteryStatusNote(c) + ')';
                hwVals[4].textContent = c.connection + ' (' + c.signal.split('·')[0].trim() + ')';
                hwVals[5].textContent = c.ip;
                hwVals[6].textContent = c.mac;
            }
        }

        nav('pg-cart');
    }

    // Initialize cart list on load
    renderCartListPage();
    renderCartEnvironment(cartList[0]);

