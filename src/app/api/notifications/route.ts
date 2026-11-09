import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authUser = getAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: authUser.id, isRead: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = getAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    if (body.all === true) {
      await prisma.notification.updateMany({
        where: { userId: authUser.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "All notifications marked as read." });
    }

    if (typeof body.id === "string" && body.id.trim()) {
      const notif = await prisma.notification.findUnique({
        where: { id: body.id.trim() },
      });

      if (!notif || notif.userId !== authUser.id) {
        return NextResponse.json({ error: "Notification not found or access denied." }, { status: 404 });
      }

      const updated = await prisma.notification.update({
        where: { id: notif.id },
        data: { isRead: true },
      });

      return NextResponse.json({ message: "Notification marked as read.", notification: updated });
    }

    return NextResponse.json({ error: "Please provide a notification ID or set all: true." }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
