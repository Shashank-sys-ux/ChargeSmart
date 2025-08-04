
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  BellRing, 
  MapPin, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert",
      title: "Station Getting Busy",
      message: "Mumbai Central Hub is expected to be 85% full in the next 30 minutes",
      time: "2 minutes ago",
      location: "Mumbai Central",
      actionRequired: true,
      read: false
    },
    {
      id: 2,
      type: "info",
      title: "Fast Charging Available",
      message: "New fast charging slot opened at Lower Parel Station",
      time: "5 minutes ago",
      location: "Lower Parel",
      actionRequired: false,
      read: false
    },
    {
      id: 3,
      type: "success",
      title: "Battery Swap Recommended",
      message: "Battery swap at Bandra will save you 20 minutes on your current route",
      time: "10 minutes ago",
      location: "Bandra",
      actionRequired: true,
      read: false
    },
    {
      id: 4,
      type: "warning",
      title: "Route Congestion",
      message: "Heavy traffic detected on your planned route. Alternative suggested.",
      time: "15 minutes ago",
      location: "Western Express Highway",
      actionRequired: true,
      read: true
    },
    {
      id: 5,
      type: "info",
      title: "Charging Complete",
      message: "Your last charging session at Pune Tech Park has been completed",
      time: "2 hours ago",
      location: "Pune Tech Park",
      actionRequired: false,
      read: true
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "alert": return "bg-red-100 text-red-700 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "success": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
                <BellRing className="w-8 h-8 mr-3 text-green-600" />
                Smart Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-3 bg-red-100 text-red-700 border-red-200">
                    {unreadCount} new
                  </Badge>
                )}
              </h2>
              <p className="text-gray-600 text-lg">
                AI-powered alerts to optimize your EV experience
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            >
              Mark All Read
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`bg-white/70 backdrop-blur-sm border-0 transition-all duration-200 ${
                !notification.read ? 'ring-2 ring-green-200 shadow-lg' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div>
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getBadgeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-3">{notification.message}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {notification.location}
                  </div>
                  
                  {notification.actionRequired && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-blue-600">
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                You're all caught up! We'll notify you of important updates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default Notifications;
