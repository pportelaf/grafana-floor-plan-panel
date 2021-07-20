import { FloorPlanOptions } from 'editor/FloorPlanEditor/FloorPlanOptions'
import { useTheme2 } from '@grafana/ui'
import { GrafanaTheme2 } from '@grafana/data'
import { Orientation, SensorOptions, SensorType, Side } from 'editor/SensorEditor/SensorOptions'

export class DefaultOptionsService {
  private static instance: DefaultOptionsService
  private theme: GrafanaTheme2
  private backgroundColor: string
  private borderColor: string

  private constructor() {
    this.theme = useTheme2()
    this.setColors()
  }

  public static getInstance(): DefaultOptionsService {
    if (!DefaultOptionsService.instance) {
      DefaultOptionsService.instance = new DefaultOptionsService()
    }

    return DefaultOptionsService.instance
  }

  private setColors() {
    this.backgroundColor = this.theme.colors.background.primary
    this.borderColor = this.theme.colors.text.primary
  }

  public getFloorPlanDefaultOptions(): FloorPlanOptions {
    return {
      name: 'New floor plan',
      fill: this.backgroundColor,
      height: 600,
      width: 400,
      stroke: this.borderColor,
      strokeWidth: 10,
      x: 100,
      y: 100
    }
  }

  public getSensorDefaultOptions(sensorType?: SensorType): SensorOptions {
    let width: number | undefined
    let height: number | undefined
    let radius: number | undefined
    let fontSize: number | undefined
    let orientation: Orientation | undefined
    let side: Side | undefined

    sensorType = sensorType || SensorType.AirQuality

    switch (sensorType) {
      case SensorType.AirQuality:
        radius = 10
        fontSize = 16
        orientation = Orientation.Left
        break
      case SensorType.WaterLevel:
        width = 60
        height = 25
        break
      case SensorType.Door:
        width = 80
        height = 80
        side = Side.Start
        orientation = Orientation.Left
        break
    }

    return {
      name: 'New sensor',
      type: sensorType,
      width,
      height,
      orientation,
      side,
      radius,
      fontSize
    }
  }
}
