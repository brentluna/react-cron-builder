// @flow

import React from 'react'
import range from 'lodash/range'
import {toOptions, defaultTo, ensureMultiple} from 'utils'
import type {Option} from 'types/Option'
import PresetTab from './PresetTab'
import MultipleSwitcher from './MultipleSwitcher'
import TimeInput from './components/TimeInput'
import DateComponent, {DayOfWeek, DayOfMonth, Month} from './components/DateComponent'
import type {PresetTabProps} from './types/PresetTabProps'

const minutesOptions = toOptions(range(1, 60)).map((option: Option) => {
    const {label, value} = option;
    if(label === '1') {
        return {
            label: `${label} min`,
            value
        }
    } else {
        return {
            label: `${label} mins`,
            value
        }
    }
});

const hoursOptions = toOptions(range(0, 24)).map((option: Option) => {
    const {label, value} = option;
    return {
        label: `${'0'.concat(label).slice(-2)}:00`,
        value
    }
});

const defaultHours = (hours: string, defaultValue: string) => {
    const [fromDefault, toDefault] = defaultValue.split('-');
    const value = defaultTo(hours, defaultValue);
    const [from, to] = value.split('-');
    return `${defaultTo(from, fromDefault)}-${defaultTo(to, toDefault)}`
};

export default class PeriodicallyFrameTab extends PresetTab {
    constructor(props: PresetTabProps, ctx: Object) {
        super(props, ctx);
        const {state} = this;
        let {hours, minutes} = state;
        minutes = defaultTo(minutes, '6');
        hours = ensureMultiple(hours, false);
        hours = defaultHours(String(hours), '9-18');
        const [hoursFrom, hoursTo] = hours.split('-');
        this.state = {
            ...state,
            minutes,
            hours,
            hoursFrom,
            hoursTo
        }
    }

    isMinutesMultiple = () => {
        const {minutesMultiple} = this.state;
        return minutesMultiple
    };

    onHoursChange = (field: string) => {
        return (value: string) => {
            const {hoursFrom, hoursTo} = this.state;
            if(field === 'hoursFrom') {
                this.setState({
                    hours: `${value}-${String(hoursTo)}`,
                    hoursFrom: value
                })
            } else {
                this.setState({
                    hours: `${String(hoursFrom)}-${value}`,
                    hoursTo: value
                })
            }
        }
    };

    getMinutes = () => {
        const {minutes} = this.state;
        if (this.isMinutesMultiple() && minutes instanceof Array) {
            return minutes.map(minute => minutesOptions.filter(option => option.value === minute)[0])
        }

        return minutesOptions.filter(option => option.value === minutes)[0]
    }

    render() {
        const {styleNameFactory} = this.props;
        const {hoursFrom, hoursTo, dayOfWeek, dayOfMonth, month} = this.state;
        return (
            <div
                {...styleNameFactory('preset')}
            >
                <div>
                    <MultipleSwitcher
                        styleNameFactory={styleNameFactory}
                        isMultiple={this.isMinutesMultiple()}
                        onChange={this.changeDateType}
                    />
                    <div
                        {...styleNameFactory('row', 'main')}
                    >
                        <TimeInput
                            options={minutesOptions}
                            onChange={this.selectMinutes}
                            value={this.getMinutes()}
                            isMulti={this.isMinutesMultiple()}
                        />
                    </div>
                </div>
                <div
                    {...styleNameFactory('row', 'hours-range')}
                >
                    <div>
                        <div
                            {...styleNameFactory('label')}
                        >
                            Starting at:
                        </div>
                        <TimeInput
                            options={hoursOptions}
                            value={hoursOptions.filter(option => option.value === hoursFrom)[0]}
                            onChange={this.onHoursChange('hoursFrom')}
                        />
                    </div>
                    <div>
                        <div
                            {...styleNameFactory('label')}
                        >
                            Ending at:
                        </div>
                        <TimeInput
                            options={hoursOptions}
                            value={hoursOptions.filter(option => option.value === hoursTo)[0]}
                            onChange={this.onHoursChange('hoursTo')}
                        />
                    </div>
                </div>
                <DateComponent
                    styleNameFactory={styleNameFactory}
                >
                    <DayOfWeek
                        value={dayOfWeek}
                        onChange={this.selectDayOfWeek}
                    />
                    <DayOfMonth
                        value={dayOfMonth}
                        onChange={this.selectDayOfMonth}
                    />
                    <Month
                        value={month}
                        onChange={this.selectMonth}
                    />
                </DateComponent>
            </div>
        )
    }
}
