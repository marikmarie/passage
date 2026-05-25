import { devicesModel } from './devices.model';
import { Device, CreateDeviceDTO, UpdateDeviceDTO } from '../../types/device.types';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class DevicesService {
  async getDeviceById(id: number): Promise<Device | null> {
    return devicesModel.findById(id);
  }

  async getDeviceByRiderId(riderId: number): Promise<Device | null> {
    return devicesModel.findByRiderId(riderId);
  }

  async getAllDevices(page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { devices, total } = await devicesModel.findAll(l, offset);

    return {
      devices,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async createDevice(data: CreateDeviceDTO): Promise<Device> {
    return devicesModel.create(data);
  }

  async updateDevice(id: number, updates: UpdateDeviceDTO): Promise<Device | null> {
    return devicesModel.update(id, updates);
  }

  async deleteDevice(id: number): Promise<boolean> {
    return devicesModel.delete(id);
  }
}

export const devicesService = new DevicesService();
