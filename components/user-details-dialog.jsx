import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserDetailsDialog({ isOpen, onClose, userDetails }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={userDetails.profilePic || "/assets/profile-pic.png"} alt={userDetails.name} />
            <AvatarFallback>{userDetails.name}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{userDetails.name}</h2>
            <p className="text-muted-foreground">@{userDetails.username}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Phone:</strong> {userDetails.mobile}</p>
          <p><strong>BGMI Player ID:</strong> {userDetails.inGamePlayerId}</p>
          <p><strong>BGMI In-Game Name:</strong> {userDetails.inGameName}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}