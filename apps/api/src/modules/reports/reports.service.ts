import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      todayAppointments,
      yesterdayAppointments,
      monthRevenue,
      lastMonthRevenue,
      newClientsThisMonth,
      totalClients,
      noShowsLast30Days,
      completedLast30Days,
      pendingFollowUps,
      unconfirmedAppointments,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: { dateTime: { gte: today, lt: tomorrow } },
      }),
      this.prisma.appointment.count({
        where: { dateTime: { gte: yesterday, lt: today } },
      }),
      this.prisma.sale.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: 'completed' },
        _sum: { total: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: 'completed',
        },
        _sum: { total: true },
      }),
      this.prisma.client.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.client.count({ where: { isActive: true } }),
      this.prisma.appointment.count({
        where: {
          status: 'NO_SHOW',
          dateTime: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          dateTime: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.medicalRecord.count({
        where: {
          followUpDate: { gte: today },
          dischargedAt: null,
        },
      }),
      this.prisma.appointment.count({
        where: {
          dateTime: { gte: today },
          confirmedAt: null,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
    ]);

    const currentRevenue = Number(monthRevenue._sum.total || 0);
    const previousRevenue = Number(lastMonthRevenue._sum.total || 0);
    const revenueDelta = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const appointmentsDelta = yesterdayAppointments > 0
      ? ((todayAppointments - yesterdayAppointments) / yesterdayAppointments) * 100
      : 0;

    const totalLast30 = completedLast30Days + noShowsLast30Days;
    const noShowRate = totalLast30 > 0 ? (noShowsLast30Days / totalLast30) * 100 : 0;

    return {
      appointments: {
        today: todayAppointments,
        yesterday: yesterdayAppointments,
        delta: Math.round(appointmentsDelta),
      },
      revenue: {
        currentMonth: currentRevenue,
        previousMonth: previousRevenue,
        delta: Math.round(revenueDelta * 10) / 10,
      },
      clients: {
        newThisMonth: newClientsThisMonth,
        total: totalClients,
      },
      noShowRate: {
        rate: Math.round(noShowRate * 10) / 10,
        noShows: noShowsLast30Days,
        completed: completedLast30Days,
      },
      followUps: {
        pending: pendingFollowUps,
      },
      confirmation: {
        unconfirmed: unconfirmedAppointments,
      },
    };
  }

  async getRevenueByDay(days: number = 7) {
    const results: { date: string; total: number }[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const agg = await this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: date, lte: endOfDay },
          status: 'completed',
        },
        _sum: { total: true },
      });

      results.push({
        date: date.toISOString().split('T')[0],
        total: Number(agg._sum.total || 0),
      });
    }

    return results;
  }

  async getAppointmentsByType(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const appointments = await this.prisma.appointment.groupBy({
      by: ['type'],
      where: { dateTime: { gte: startDate } },
      _count: { id: true },
    });

    return appointments.map((a) => ({
      type: a.type,
      count: a._count.id,
    }));
  }
}
