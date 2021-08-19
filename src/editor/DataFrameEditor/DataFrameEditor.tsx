import React from 'react'
import { DataFrameOptions } from './DataFrameOptions'
import { InlineField, Input, Select, UnitPicker, useStyles2 } from '@grafana/ui'
import { Labels, StandardEditorContext, GrafanaTheme2, DataFrame } from '@grafana/data'
import { ThresholdsEditor } from '../ThresholdsEditor/ThresholdsEditor'
import { ThresholdOptions } from 'editor/ThresholdsEditor/ThresholdOptions'
import { css } from 'emotion'
import { SensorType } from 'editor/SensorEditor/SensorOptions'

interface Props {
  value: DataFrameOptions
  sensorType: SensorType
  onChange: (value?: DataFrameOptions) => void
  context: StandardEditorContext<any>
}

interface SelectOptions {
  label: string
  value: string
}

export const DataFrameEditor: React.FC<Props> = ({ context, onChange, sensorType, value }) => {
  const styles = useStyles2(getStyles)
  let dataFrameOptions: DataFrameOptions = {
    ...value,
  }
  const dataFramesLabels = getDataFramesLabels(context, sensorType)
  const facilitySelectOptions = getFacilitySelectOptions(dataFramesLabels, dataFrameOptions)
  const plotSelectOptions = getPlotSelectOptions(dataFramesLabels, dataFrameOptions)
  const fieldNameSelectOptions = getFieldNameSelectOptions(dataFramesLabels, dataFrameOptions)

  const onChangeFacility = ({ value }: any) => {
    dataFrameOptions.facility = value

    onChange(dataFrameOptions)
  }

  const onChangePlot = ({ value }: any) => {
    dataFrameOptions.plot = value

    onChange(dataFrameOptions)
  }

  const onChangeFieldName = ({ value }: any) => {
    dataFrameOptions.fieldName = value

    onChange(dataFrameOptions)
  }

  const onChangeLabel = ({ target }: any) => {
    dataFrameOptions.label = target.value

    onChange(dataFrameOptions)
  }

  const onchangeUnit = (value: any) => {
    dataFrameOptions.unit = value

    onChange(dataFrameOptions)
  }

  const onChangeDecimals = ({ target }: any) => {
    const value = target.value

    if (value !== 0 && value !== undefined) {
      dataFrameOptions.decimals = Number(value)
    } else {
      dataFrameOptions.decimals = value
    }

    onChange(dataFrameOptions)
  }

  const onChangeThresholds = (thresholds: ThresholdOptions[] | undefined) => {
    dataFrameOptions.thresholds = thresholds || []

    onChange(dataFrameOptions)
  }

  return (
    <div className={styles.wrapper}>
      <InlineField label="Facility">
        <Select
          allowCustomValue
          onChange={onChangeFacility}
          options={facilitySelectOptions}
          value={dataFrameOptions.facility}
        />
      </InlineField>

      <InlineField label="Plot">
        <Select allowCustomValue onChange={onChangePlot} options={plotSelectOptions} value={dataFrameOptions.plot} />
      </InlineField>

      <InlineField label="Field name">
        <Select
          allowCustomValue
          onChange={onChangeFieldName}
          options={fieldNameSelectOptions}
          value={dataFrameOptions.fieldName}
        />
      </InlineField>

      <InlineField label="Label">
        <Input css="" onChange={onChangeLabel} type="text" value={dataFrameOptions.label} />
      </InlineField>

      <InlineField label="Unit">
        <UnitPicker onChange={onchangeUnit} value={dataFrameOptions.unit} />
      </InlineField>

      <InlineField label="Decimals">
        <Input css="" onChange={onChangeDecimals} type="number" value={dataFrameOptions.decimals} />
      </InlineField>

      <ThresholdsEditor
        className={styles.thresholdsEditor}
        hasPriority={sensorType === SensorType.AirQuality}
        onChange={onChangeThresholds}
        value={dataFrameOptions.thresholds}
      />
    </div>
  )
}

const getFacilitySelectOptions = (labels: Labels[], dataFrameOptions: DataFrameOptions): SelectOptions[] => {
  let facilitySelectOptions: SelectOptions[] = []

  if (dataFrameOptions.facility) {
    facilitySelectOptions.push({ value: dataFrameOptions.facility, label: dataFrameOptions.facility })
  }

  labels.forEach((label) => {
    const facilityLabel = label.facility || ''

    if (facilityLabel !== '' && !isLabelInSelectOptions(facilityLabel, facilitySelectOptions)) {
      facilitySelectOptions.push({ value: facilityLabel, label: facilityLabel })
    }
  })

  return facilitySelectOptions
}

const getPlotSelectOptions = (labels: Labels[], dataFrameOptions: DataFrameOptions): SelectOptions[] => {
  let plotSelectOptions: SelectOptions[] = []
  let labelsWithCurrentFacility = labels

  if (dataFrameOptions.plot) {
    plotSelectOptions.push({ label: dataFrameOptions.plot, value: dataFrameOptions.plot })
  }

  if (dataFrameOptions.facility !== '') {
    labelsWithCurrentFacility = labels.filter(({ facility }) => facility === dataFrameOptions.facility)
  }

  labelsWithCurrentFacility.forEach((label) => {
    const plotLabel = label.plot || ''

    if (plotLabel !== '' && !isLabelInSelectOptions(plotLabel, plotSelectOptions)) {
      plotSelectOptions.push({ value: plotLabel, label: plotLabel })
    }
  })

  return plotSelectOptions
}

const getFieldNameSelectOptions = (labels: Labels[], dataFrameOptions: DataFrameOptions): SelectOptions[] => {
  let fieldNameSelectOptions: SelectOptions[] = []
  let labelsWithCurrentFilters = labels
  let facilitySelected = dataFrameOptions.facility
  let plotSelected = dataFrameOptions.plot

  if (dataFrameOptions.fieldName) {
    fieldNameSelectOptions.push({ value: dataFrameOptions.fieldName, label: dataFrameOptions.fieldName })
  }

  if (facilitySelected !== '' && plotSelected !== '') {
    labelsWithCurrentFilters = labels.filter(({ facility, plot }) => {
      return facility === facilitySelected && plot === plotSelected
    })
  }

  labelsWithCurrentFilters.forEach((label) => {
    const fieldNameLabel = label.name || ''

    if (fieldNameLabel !== '' && !isLabelInSelectOptions(fieldNameLabel, fieldNameSelectOptions)) {
      fieldNameSelectOptions.push({ value: fieldNameLabel, label: fieldNameLabel })
    }
  })

  return fieldNameSelectOptions
}

const isLabelInSelectOptions = (label: string, selectOptions: SelectOptions[]): boolean => {
  return !!selectOptions.find(({ value }) => value === label)
}

const getDataFramesLabels = (context: StandardEditorContext<any>, sensorType: SensorType): Labels[] => {
  let labels: Labels[] = []

  filterDataFramesByMeasurement(context.data || [], sensorType).forEach((dataFrame) => {
    dataFrame.fields.forEach((field) => {
      if (field.type !== 'time' && field.labels) {
        labels.push({ ...field.labels, name: field.name })
      }
    })
  })

  return labels
}

const filterDataFramesByMeasurement = (dataFrames: DataFrame[], sensorType: SensorType): DataFrame[] => {
  return dataFrames.filter((dataFrame) => dataFrame.name === sensorType)
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      padding-top: ${theme.spacing(0.5)};
    `,
    thresholdsEditor: css`
      margin-top: ${theme.spacing(2)};
    `,
  }
}
