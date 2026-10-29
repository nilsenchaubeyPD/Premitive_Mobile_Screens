import { useCallback, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CandidateHeader } from '../../components/Headers';
import { SebFrame } from '../../components/SebFrame';
import { phaseOf } from '../../lib/pin';
import { actions, getState, useApp } from '../../lib/store';
import { ExitModal, POPUPS, Popup } from './ExitModal';
import { Feedback } from './Feedback';
import { Instructions } from './Instructions';
import { Login } from './Login';
import { Question } from './Question';
import { Sections } from './Sections';

export const SCREENS = ['login', 'instructions', 'sections', 'sections-progress', 'question', 'feedback'] as const;
export type Screen = (typeof SCREENS)[number];

/** Screens where the exam has been attempted: D1 applies and the timer can auto-submit. */
const ATTEMPTED: Screen[] = ['sections', 'sections-progress', 'question'];

export type ExitSource = 'quit_icon' | 'feedback_cta' | 'login_link';

export default function CandidateRoute() {
  const params = useParams();
  const screen = params.screen as Screen;
  const location = useLocation();
  const navigate = useNavigate();
  const s = useApp();

  const match = location.pathname.match(/\/exit\/([a-z]+)\/?$/);
  const popup = match && (POPUPS as string[]).includes(match[1]) ? (match[1] as Popup) : null;
  const base = `/candidate/${screen}`;

  const go = useCallback(
    (p: Popup | null) => navigate(p ? `${base}/exit/${p}${location.search}` : `${base}${location.search}`, { replace: true }),
    [navigate, base, location.search],
  );

  // Screen-entry state, so every screen can be opened directly by route.
  useEffect(() => {
    if (screen === 'sections') actions.setCompletedSections(0);
    if (screen === 'sections-progress' && getState().completedSections < 1) actions.setCompletedSections(1);
    if (screen === 'feedback') actions.setSubmitted(true);
    if (screen === 'login' || screen === 'instructions' || ATTEMPTED.includes(screen)) actions.setSubmitted(false);
  }, [screen]);

  // Edge case 2: exam timer hits zero → close any pop-up, auto-submit, land on feedback.
  const attempted = ATTEMPTED.includes(screen);
  useEffect(() => {
    if (attempted && !s.submitted && s.now >= s.examEnd) {
      actions.discardToken();
      actions.setSubmitted(true);
      navigate('/candidate/feedback', { replace: true });
    }
  }, [attempted, s.submitted, s.now, s.examEnd, navigate]);

  if (!(SCREENS as readonly string[]).includes(screen)) return <Navigate to="/candidate/login" replace />;

  const openExit = (source: ExitSource) => {
    if (popup) return; // edge case 8: never two pop-ups
    actions.log('exit_button_clicked', { source, phase: phaseOf(s), submitted: s.submitted, screen });
    navigate(`${base}/exit/pin${location.search}`);
  };

  const showTimer = attempted && !s.submitted && s.now < s.examEnd;

  return (
    <SebFrame>
      <CandidateHeader
        endsInMs={showTimer ? s.examEnd - s.now : undefined}
        offline={s.offline}
        onQuit={() => openExit('quit_icon')}
        quitDisabled={!!popup}
      />
      <main className="min-h-0 flex-1 overflow-y-auto bg-white">
        {screen === 'login' && <Login onExit={() => openExit('login_link')} exitDisabled={!!popup} />}
        {screen === 'instructions' && <Instructions />}
        {(screen === 'sections' || screen === 'sections-progress') && <Sections />}
        {screen === 'question' && <Question />}
        {screen === 'feedback' && <Feedback onExit={() => openExit('feedback_cta')} exitDisabled={!!popup} />}
      </main>
      {popup && <ExitModal key={base} popup={popup} go={go} />}
    </SebFrame>
  );
}
