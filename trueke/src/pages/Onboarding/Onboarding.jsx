import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { savePersonalData, submitKycDocuments } from '../../services/usersService';
import { checkImageQuality, uploadImage } from '../../services/storageService';
import { COUNTRIES } from '../../utils/constants';
import styles from './Onboarding.module.css';

const STEP_LABELS = ['Datos', 'Documento', 'Selfie', 'Listo'];

export default function Onboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [personal, setPersonal] = useState({
    nombre: profile?.name || '',
    documento: profile?.documentId || '',
    fnac: profile?.birthDate || '',
    pais: profile?.country || null,
    ciudad: profile?.city || '',
    cpostal: profile?.postalCode || '',
  });

  const [docFront, setDocFront] = useState(null); // {status, url, reason}
  const [docBack, setDocBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const step1Valid =
    personal.nombre.trim() && personal.documento.trim() && personal.fnac && personal.pais && personal.ciudad.trim() && personal.cpostal.trim();
  const step2Valid = docFront?.status === 'approved' && docBack?.status === 'approved';
  const step3Valid = selfie?.status === 'approved';

  async function goNext() {
    if (step === 1 && step1Valid) {
      await savePersonalData(user.uid, {
        name: personal.nombre.trim(),
        documentId: personal.documento.trim(),
        birthDate: personal.fnac,
        country: personal.pais,
        city: personal.ciudad.trim(),
        postalCode: personal.cpostal.trim(),
      });
      setStep(2);
    } else if (step === 2 && step2Valid) {
      setStep(3);
    } else if (step === 3 && step3Valid) {
      setSubmitting(true);
      await submitKycDocuments(user.uid, {
        docFrontUrl: docFront.url,
        docBackUrl: docBack.url,
        selfieUrl: selfie.url,
      });
      setSubmitting(false);
      setStep(4);
    }
  }

  function goBack() {
    if (step === 1) navigate(-1);
    else setStep((s) => s - 1);
  }

  const nextEnabled = (step === 1 && step1Valid) || (step === 2 && step2Valid) || (step === 3 && step3Valid);

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.topRow}>
          <button className="icon-btn" onClick={goBack}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className={styles.topbarTitle}>Verificá tu identidad</div>
        </div>
        <StepsRow current={step} />
      </div>

      <div className={styles.bodyScroll}>
        {step === 1 && <StepPersonal value={personal} onChange={setPersonal} email={user.email} />}
        {step === 2 && (
          <StepDocuments uid={user.uid} docFront={docFront} setDocFront={setDocFront} docBack={docBack} setDocBack={setDocBack} />
        )}
        {step === 3 && <StepSelfie uid={user.uid} selfie={selfie} setSelfie={setSelfie} />}
        {step === 4 && <StepConfirm />}
      </div>

      {step < 4 && (
        <div className={styles.footerNav}>
          <button className="btn-ghost" onClick={goBack}>
            Atrás
          </button>
          <button className={`btn-solid ${nextEnabled ? 'active' : ''}`} onClick={goNext} disabled={!nextEnabled}>
            {submitting ? 'Enviando…' : step === 3 ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      )}
    </>
  );
}

function StepsRow({ current }) {
  return (
    <div className={styles.steps}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'active' : '';
        return (
          <React.Fragment key={label}>
            <div className={`${styles.stepDotWrap} ${styles[state] || ''}`}>
              <div className={styles.stepDot}>{n < current ? '✓' : n}</div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
            {n < STEP_LABELS.length && <div className={`${styles.stepLine} ${n < current ? styles.done : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepPersonal({ value, onChange, email }) {
  function set(field, v) {
    onChange((prev) => ({ ...prev, [field]: v }));
  }
  return (
    <div>
      <div className={styles.stepTitle}>Tus datos</div>
      <div className={styles.stepSub}>
        Los necesitamos para verificar tu identidad y darte de alta como comprador y vendedor verificado.
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Nombre completo</div>
        <input type="text" value={value.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre y apellido" />
      </div>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Documento de identidad</div>
          <input type="text" value={value.documento} onChange={(e) => set('documento', e.target.value)} placeholder="N° de cédula / DNI" />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Fecha de nacimiento</div>
          <input type="date" value={value.fnac} onChange={(e) => set('fnac', e.target.value)} />
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>Correo electrónico</div>
        <input type="email" value={email} disabled />
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>País</div>
        <div className="pill-grid">
          {COUNTRIES.map((c) => (
            <div key={c} className={`pill ${value.pais === c ? 'sel' : ''}`} onClick={() => set('pais', c)}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Ciudad</div>
          <input type="text" value={value.ciudad} onChange={(e) => set('ciudad', e.target.value)} placeholder="Ej: Punta del Este" />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Código postal</div>
          <input type="text" value={value.cpostal} onChange={(e) => set('cpostal', e.target.value)} placeholder="Ej: 20100" />
        </div>
      </div>
    </div>
  );
}

function StepDocuments({ uid, docFront, setDocFront, docBack, setDocBack }) {
  return (
    <div>
      <div className={styles.stepTitle}>Foto de tu documento</div>
      <div className={styles.stepSub}>
        Sacá una foto del frente y el dorso. Verificamos que la imagen sea legible antes de subirla.
      </div>

      <DocCapture uid={uid} label="Frente del documento" folder="front" value={docFront} onChange={setDocFront} />
      <DocCapture uid={uid} label="Dorso del documento" folder="back" value={docBack} onChange={setDocBack} />

      <div className={styles.infoBox}>
        🔒 Tu documento se guarda cifrado y separado del resto de tu perfil. Solo se usa para verificar tu identidad.
      </div>
    </div>
  );
}

function DocCapture({ uid, label, folder, value, onChange }) {
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onChange({ status: 'analyzing' });
    const quality = await checkImageQuality(file);
    if (!quality.ok) {
      onChange({ status: 'rejected', reason: quality.reason });
      return;
    }
    try {
      const url = await uploadImage(`kyc/${uid}`, file);
      onChange({ status: 'approved', url });
    } catch (err) {
      console.error('Error subiendo a Cloudinary:', err);
      onChange({ status: 'rejected', reason: err.message || 'No se pudo subir la foto, probá de nuevo.' });
    }
  }

  return (
    <div className={`${styles.docCard} ${value ? styles.filled : ''}`}>
      <div className={styles.docThumb}>
        {value?.url ? (
          <img src={value.url} alt="" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A7568" strokeWidth="2">
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <circle cx="12" cy="12.5" r="3.2" />
          </svg>
        )}
      </div>
      <div className={styles.docInfo}>
        <div className={styles.docName}>{label}</div>
        <div
          className={`${styles.docStatus} ${value?.status === 'approved' ? styles.ok : ''} ${
            value?.status === 'rejected' ? styles.err : ''
          }`}
        >
          {value?.status === 'analyzing' && (
            <>
              <div className="mini-spinner" /> Analizando…
            </>
          )}
          {value?.status === 'approved' && '✓ Cargado'}
          {value?.status === 'rejected' && value.reason}
          {!value && 'Sin capturar'}
        </div>
      </div>
      <label className={styles.docBtn}>
        {value?.status === 'approved' ? 'Reemplazar' : 'Tomar foto'}
        <input type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      </label>
    </div>
  );
}

function StepSelfie({ uid, selfie, setSelfie }) {
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSelfie({ status: 'analyzing', preview: URL.createObjectURL(file) });
    const quality = await checkImageQuality(file);
    if (!quality.ok) {
      setSelfie({ status: 'rejected', reason: quality.reason });
      return;
    }
    try {
      const url = await uploadImage(`kyc/${uid}`, file);
      setSelfie({ status: 'approved', url });
    } catch (err) {
      console.error('Error subiendo a Cloudinary:', err);
      setSelfie({ status: 'rejected', reason: err.message || 'No se pudo subir la selfie, probá de nuevo.' });
    }
  }

  return (
    <div>
      <div className={styles.stepTitle}>Selfie de verificación</div>
      <div className={styles.stepSub}>
        Sacate una selfie con buena luz. Queda asociada a tu documento para que el equipo de Trueke revise tu
        identidad.
      </div>

      <div className={styles.faceStage}>
        <div className={styles.faceRing}>
          {!selfie && <div className={styles.facePlaceholder}>Centrá tu rostro dentro del óvalo</div>}
          {selfie?.preview && <img className={styles.show} src={selfie.preview} alt="" />}
          {selfie?.url && <img className={styles.show} src={selfie.url} alt="" />}
          {selfie?.status === 'approved' && (
            <div className={`${styles.faceResult} ${styles.show}`}>
              <div className={styles.faceResultCheck}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Selfie recibida — pendiente de revisión</span>
            </div>
          )}
        </div>
        <label className={styles.btnSelfie}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <circle cx="12" cy="12.5" r="3.2" />
          </svg>
          {selfie?.status === 'approved' ? 'Tomar otra selfie' : 'Tomar selfie'}
          <input type="file" accept="image/*" capture="user" hidden onChange={onFile} />
        </label>
        <div className={styles.statusLine}>
          {selfie?.status === 'analyzing' && 'Subiendo selfie…'}
          {selfie?.status === 'rejected' && selfie.reason}
        </div>
      </div>
    </div>
  );
}

function StepConfirm() {
  const navigate = useNavigate();
  return (
    <div className={styles.confirmWrap}>
      <div className={styles.confirmCheck}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className={styles.confirmTitle}>¡Tu perfil está en verificación!</div>
      <div className={styles.confirmSub}>
        Revisamos tus datos, tu documento y tu selfie. Te avisamos por correo cuando tu cuenta quede verificada —
        mientras tanto ya podés comprar y publicar normalmente.
      </div>
      <div className={styles.recap}>
        <div className={styles.recapItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3EA26C" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Datos personales completos
        </div>
        <div className={styles.recapItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3EA26C" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Documento de identidad cargado
        </div>
        <div className={styles.recapItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3EA26C" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Selfie enviada para revisión
        </div>
      </div>
      <button className="btn-solid active" style={{ width: '100%' }} onClick={() => navigate('/')}>
        Ir al inicio
      </button>
    </div>
  );
}
