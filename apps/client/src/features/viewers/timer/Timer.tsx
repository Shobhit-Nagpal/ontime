import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CustomFields,
  MessageState,
  OntimeEvent,
  Playback,
  ProjectData,
  Settings,
  SimpleTimerState,
  TimerPhase,
  TimerType,
  ViewSettings,
} from 'ontime-types';

import { FitText } from '../../../common/components/fit-text/FitText';
import MultiPartProgressBar from '../../../common/components/multi-part-progress-bar/MultiPartProgressBar';
import TitleCard from '../../../common/components/title-card/TitleCard';
import ViewLogo from '../../../common/components/view-logo/ViewLogo';
import ViewParamsEditor from '../../../common/components/view-params-editor/ViewParamsEditor';
import { useWindowTitle } from '../../../common/hooks/useWindowTitle';
import { ViewExtendedTimer } from '../../../common/models/TimeManager.type';
import { formatTime, getDefaultFormat } from '../../../common/utils/time';
import { useTranslation } from '../../../translation/TranslationProvider';
import SuperscriptTime from '../common/superscript-time/SuperscriptTime';
import { getFormattedTimer, getPropertyValue, getTimerByType, isStringBoolean } from '../common/viewUtils';

import { getTimerOptions } from './timer.options';

import './Timer.scss';

// motion
const titleVariants = {
  hidden: {
    x: -2500,
  },
  visible: {
    x: 0,
    transition: {
      duration: 1,
    },
  },
  exit: {
    x: -2500,
  },
};

export const MotionTitleCard = motion(TitleCard);

interface TimerProps {
  auxTimer: SimpleTimerState;
  customFields: CustomFields;
  eventNext: OntimeEvent | null;
  eventNow: OntimeEvent | null;
  general: ProjectData;
  isMirrored: boolean;
  message: MessageState;
  settings: Settings | undefined;
  time: ViewExtendedTimer;
  viewSettings: ViewSettings;
}

export default function Timer(props: TimerProps) {
  const { auxTimer, customFields, eventNow, eventNext, general, isMirrored, message, settings, time, viewSettings } =
    props;

  const { getLocalizedString } = useTranslation();
  const [searchParams] = useSearchParams();

  useWindowTitle('Timer');

  // USER OPTIONS
  const userOptions = {
    hideClock: false,
    hideCards: false,
    hideProgress: false,
    hideMessage: false,
    hideTimerSeconds: false,
    hideClockSeconds: false,
    removeLeadingZeros: true,
  };

  const hideClock = searchParams.get('hideClock');
  userOptions.hideClock = isStringBoolean(hideClock);

  const hideCards = searchParams.get('hideCards');
  userOptions.hideCards = isStringBoolean(hideCards);

  const hideProgress = searchParams.get('hideProgress');
  userOptions.hideProgress = isStringBoolean(hideProgress);

  const hideMessage = searchParams.get('hideMessage');
  userOptions.hideMessage = isStringBoolean(hideMessage);

  const hideClockSeconds = searchParams.get('hideClockSeconds');
  userOptions.hideClockSeconds = isStringBoolean(hideClockSeconds);
  const clock = formatTime(time.clock);

  const hideTimerSeconds = searchParams.get('hideTimerSeconds');
  userOptions.hideTimerSeconds = isStringBoolean(hideTimerSeconds);

  const showLeadingZeros = searchParams.get('showLeadingZeros');
  userOptions.removeLeadingZeros = !isStringBoolean(showLeadingZeros);

  const secondarySource = searchParams.get('secondary-src');
  const secondaryTextNow = getPropertyValue(eventNow, secondarySource);
  const secondaryTextNext = getPropertyValue(eventNext, secondarySource);

  const main = searchParams.get('main');
  const mainFieldNow = (main ? getPropertyValue(eventNow, main) : eventNow?.title) ?? '';
  const mainFieldNext = (main ? getPropertyValue(eventNext, main) : eventNext?.title) ?? '';

  const showOverlay = message.timer.text !== '' && message.timer.visible;
  const isPlaying = time.playback !== Playback.Pause;

  const timerIsTimeOfDay = time.timerType === TimerType.Clock;

  const finished = time.phase === TimerPhase.Overtime;
  const totalTime = (time.duration ?? 0) + (time.addedTime ?? 0);

  const shouldShowModifiers = time.timerType === TimerType.CountDown || time.countToEnd;
  const showEndMessage = shouldShowModifiers && finished && viewSettings.endMessage;
  const showProgress =
    eventNow !== null &&
    time.timerType !== TimerType.None &&
    time.timerType !== TimerType.Clock &&
    time.playback !== Playback.Stop;
  const showFinished = shouldShowModifiers && finished && (shouldShowModifiers || showEndMessage);
  const showWarning = shouldShowModifiers && time.phase === TimerPhase.Warning;
  const showDanger = shouldShowModifiers && time.phase === TimerPhase.Danger;
  const showClock = time.timerType !== TimerType.Clock;

  const secondaryContent = ((): string | undefined => {
    if (message.timer.secondarySource === 'aux') {
      return getFormattedTimer(auxTimer.current, TimerType.CountDown, getLocalizedString('common.minutes'), {
        removeSeconds: userOptions.hideTimerSeconds,
        removeLeadingZero: userOptions.removeLeadingZeros,
      });
    }
    if (message.timer.secondarySource === 'external' && message.external) {
      return message.external;
    }
    return;
  })();

  let timerColor = viewSettings.normalColor;
  if (!timerIsTimeOfDay && showProgress && showWarning) timerColor = viewSettings.warningColor;
  if (!timerIsTimeOfDay && showProgress && showDanger) timerColor = viewSettings.dangerColor;

  const stageTimer = getTimerByType(viewSettings.freezeEnd, time);
  const display = getFormattedTimer(stageTimer, time.timerType, getLocalizedString('common.minutes'), {
    removeSeconds: userOptions.hideTimerSeconds,
    removeLeadingZero: userOptions.removeLeadingZeros,
  });

  const stageTimerCharacters = display.replace('/:/g', '').length;

  const baseClasses = `stage-timer ${isMirrored ? 'mirror' : ''}`;

  let timerFontSize = 89 / (stageTimerCharacters - 1);
  // we need to shrink the timer if the external is going to be there
  if (secondaryContent) {
    timerFontSize *= 0.8;
  }
  const externalFontSize = timerFontSize * 0.4;
  const timerContainerClasses = `timer-container ${message.timer.blink ? (showOverlay ? '' : 'blink') : ''}`;
  const timerClasses = `timer ${!isPlaying ? 'timer--paused' : ''} ${showFinished ? 'timer--finished' : ''}`;

  const defaultFormat = getDefaultFormat(settings?.timeFormat);
  const timerOptions = getTimerOptions(defaultFormat, customFields);
  const disableProgress = timerIsTimeOfDay || time.timerType === TimerType.None;

  return (
    <div className={showFinished ? `${baseClasses} stage-timer--finished` : baseClasses} data-testid='timer-view'>
      {general?.projectLogo && <ViewLogo name={general.projectLogo} className='logo' />}

      <ViewParamsEditor viewOptions={timerOptions} />
      <div className={message.timer.blackout ? 'blackout blackout--active' : 'blackout'} />
      {!userOptions.hideMessage && (
        <div className={showOverlay ? 'message-overlay message-overlay--active' : 'message-overlay'}>
          <FitText mode='multi' min={32} max={256} className={`message ${message.timer.blink ? 'blink' : ''}`}>
            {message.timer.text}
          </FitText>
        </div>
      )}

      {!userOptions.hideClock && (
        <div className={`clock-container ${showClock ? '' : 'clock-container--hidden'}`}>
          <div className='label'>{getLocalizedString('common.time_now')}</div>
          <SuperscriptTime time={clock} className='clock' />
        </div>
      )}

      <div className={timerContainerClasses}>
        {showEndMessage ? (
          <div className='end-message'>{viewSettings.endMessage}</div>
        ) : (
          <div
            className={timerClasses}
            style={{
              fontSize: `${timerFontSize}vw`,
              '--phase-color': timerColor,
            }}
          >
            {display}
          </div>
        )}
        <div
          className={`secondary${secondaryContent ? '' : ' secondary--hidden'}`}
          style={{ fontSize: `${externalFontSize}vw` }}
        >
          {secondaryContent}
        </div>
      </div>

      {!userOptions.hideProgress && (
        <MultiPartProgressBar
          className={isPlaying ? 'progress-container' : 'progress-container progress-container--paused'}
          now={disableProgress ? null : time.current}
          complete={totalTime}
          normalColor={viewSettings.normalColor}
          warning={eventNow?.timeWarning}
          warningColor={viewSettings.warningColor}
          danger={eventNow?.timeDanger}
          dangerColor={viewSettings.dangerColor}
          hidden={!showProgress}
        />
      )}

      {!userOptions.hideCards && (
        <>
          <AnimatePresence>
            {eventNow?.title && (
              <MotionTitleCard
                className='event now'
                key='now'
                variants={titleVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                label='now'
                title={mainFieldNow}
                secondary={secondaryTextNow}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {eventNext?.title && (
              <MotionTitleCard
                key='next'
                variants={titleVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                label='next'
                title={mainFieldNext}
                secondary={secondaryTextNext}
                className='event next'
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
