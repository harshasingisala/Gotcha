import React, { useEffect, useState } from "react";

const studentIdPattern = /^[A-Za-z0-9][A-Za-z0-9/-]{3,31}$/;

export default function ClaimWizard({ item, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    proof_description: "",
    student_id: "",
    otp: "",
    verification_answer: "",
    challenge_answers: {},
    proof_image: null
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(onClose, 2600);
      return () => clearTimeout(timer);
    }
  }, [step, onClose]);

  function pickProofImage(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5242880) {
      setError("Choose a JPEG, PNG, or WebP image under 5MB.");
      return;
    }
    setError("");
    setForm({ ...form, proof_image: file });
  }

  async function finish() {
    setError("");
    if (form.proof_description.trim().length < 40) {
      setError("Add at least 40 characters of identifying evidence.");
      setStep(1);
      return;
    }
    if (!studentIdPattern.test(form.student_id.trim())) {
      setError("Enter a valid student ID.");
      setStep(2);
      return;
    }
    if (!challengeReady) {
      setError("Answer every verification challenge before submitting.");
      setStep(2);
      return;
    }
    try {
      await onSubmit(form);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || "Claim submission failed.");
    }
  }

  const evidenceReady = form.proof_description.trim().length >= 40;
  const identityReady = studentIdPattern.test(form.student_id.trim());
  const challengeQuestions = item.claim_challenge_questions?.length ? item.claim_challenge_questions : [
    { id: "owner_clue", label: "Owner-only detail", question: "What unique detail proves this item is yours?", required: true },
    { id: "category_check", label: "Item type", question: `What kind of item are you claiming? Hint: ${item.category || "item"}.`, required: true },
    { id: "zone_check", label: "Campus zone", question: `Where did you likely lose it? Hint: ${item.location_zone || "campus"}.`, required: true }
  ];
  const challengeReady = challengeQuestions.every((question) => !question.required || (form.challenge_answers[question.id] || "").trim().length >= 2);

  function setChallengeAnswer(id, value) {
    const answers = { ...form.challenge_answers, [id]: value };
    setForm({
      ...form,
      challenge_answers: answers,
      verification_answer: answers.owner_clue || form.verification_answer
    });
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lift">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-orange-deep">Verified claim</p>
            <h2 className="mt-1 text-xl font-black text-navy">Prove this is yours</h2>
            <p className="mt-1 text-sm text-muted">Claims go to admin review before handoff details are shared.</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-outline text-muted hover:bg-surface" onClick={onClose} aria-label="Close claim form">x</button>
        </div>

        <div className="mt-5 h-2 rounded-full bg-surface">
          <div className="h-2 rounded-full bg-orange transition-all" style={{ width: `${step * 25}%` }} />
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        {step === 1 && (
          <div className="mt-5">
            <label className="text-sm font-black text-navy">Identifying evidence</label>
            <textarea
              className="mt-2 w-full rounded-lg border border-outline p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
              rows="5"
              placeholder="Describe details only the owner should know: case color, wallpaper, marks, contents, serial hints, or last interaction."
              value={form.proof_description}
              onChange={(event) => setForm({ ...form, proof_description: event.target.value })}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-muted">
              <span>{form.proof_description.trim().length}/40 minimum</span>
              <span className="truncate">{form.proof_image ? form.proof_image.name : "Optional proof image"}</span>
            </div>
            <input className="mt-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => pickProofImage(event.target.files[0])} />
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-3">
            <input className="w-full rounded-lg border border-outline p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15" placeholder="Student ID" value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} />
            <input className="w-full rounded-lg border border-outline p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15" placeholder="6-digit campus verification code" inputMode="numeric" maxLength="6" value={form.otp} onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, "") })} />
            <div className="rounded-xl bg-surface p-3">
              <p className="text-sm font-black text-navy">Owner verification challenge</p>
              <div className="mt-3 space-y-3">
                {challengeQuestions.map((question) => (
                  <label key={question.id} className="block">
                    <span className="text-xs font-black uppercase text-muted">{question.label}</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-outline bg-white p-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
                      placeholder={question.question}
                      value={form.challenge_answers[question.id] || ""}
                      onChange={(event) => setChallengeAnswer(question.id, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 rounded-lg bg-page p-4">
            <div className="font-black text-navy">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{form.proof_description}</p>
            <div className="mt-3 grid gap-2 text-xs font-black text-navy">
              <span className="rounded-lg bg-white p-2">Student ID captured</span>
              <span className="rounded-lg bg-white p-2">Verification challenge answered</span>
              <span className="rounded-lg bg-white p-2">Admin review required before handoff</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-lg font-black text-green-700">OK</div>
            <p className="mt-4 font-black text-navy">Claim submitted for review</p>
            <p className="mt-1 text-sm text-muted">You will be notified when an admin reviews the evidence.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {step > 1 && step < 4 && <button className="rounded-lg border border-outline px-4 py-2 text-sm font-black text-muted" onClick={() => setStep(step - 1)}>Back</button>}
          {step === 1 && <button className="rounded-lg bg-navy px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!evidenceReady} onClick={() => setStep(2)}>Next</button>}
          {step === 2 && <button className="rounded-lg bg-navy px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!identityReady || !challengeReady} onClick={() => setStep(3)}>Next</button>}
          {step === 3 && <button className="rounded-lg bg-orange px-4 py-2 text-sm font-black text-white" onClick={finish}>Submit for review</button>}
        </div>
      </div>
    </div>
  );
}
