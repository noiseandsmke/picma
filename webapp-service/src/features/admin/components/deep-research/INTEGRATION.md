# Deep Research Frontend Integration Guide

## Overview

This guide shows how to integrate the AI Deep Research feature into your React frontend application.

---

## Quick Start

### 1. Import the Component

```tsx
import { DeepResearchButton } from '@/features/admin/components/deep-research';
import { PropertyLeadDto } from '@/features/admin/services/leadService';
```

### 2. Add to Your UI

```tsx
// In any component that has access to a PropertyLeadDto
<DeepResearchButton lead={lead} />
```

That's it! The button will:
- Open a dialog when clicked
- Start streaming research from the backend
- Display real-time progress
- Show the final report
- Handle errors and reconnections automatically

---

## Integration Examples

### Example 1: In Lead Detail Dialog

```tsx
// In LeadDetailDialog.tsx
import { DeepResearchButton } from '@/features/admin/components/deep-research';

export const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({ lead, open, onOpenChange }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Lead Details - #{lead.id}</DialogTitle>
                </DialogHeader>

                {/* Your existing lead details content */}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {/* Add Deep Research Button */}
                    <DeepResearchButton lead={lead} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
```

### Example 2: In Lead List Table

```tsx
// In LeadsTable.tsx
import { DeepResearchButton } from '@/features/admin/components/deep-research';

const columns: ColumnDef<PropertyLeadDto>[] = [
    // ... other columns
    {
        id: 'actions',
        cell: ({ row }) => {
            const lead = row.original;
            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                    {/* Add Deep Research Button */}
                    <DeepResearchButton 
                        lead={lead} 
                        variant="ghost" 
                        size="sm" 
                    />
                </div>
            );
        },
    },
];
```

### Example 3: Custom Styled Button

```tsx
<DeepResearchButton 
    lead={lead}
    variant="outline"
    size="lg"
    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
/>
```

### Example 4: As Icon Button

```tsx
<DeepResearchButton 
    lead={lead}
    variant="ghost"
    size="icon"
/>
```

---

## Component API

### DeepResearchButton Props

```typescript
interface DeepResearchButtonProps {
    lead: PropertyLeadDto;              // Required: The lead to research
    variant?: 'default' | 'outline' | 'ghost';  // Button style
    size?: 'default' | 'sm' | 'lg' | 'icon';    // Button size
    className?: string;                 // Additional CSS classes
}
```

### DeepResearchDialog Props

If you want to use the dialog directly:

```typescript
interface DeepResearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: PropertyLeadDto | null;
}
```

---

## Features

### Real-time Streaming

The component uses Server-Sent Events (SSE) to stream research progress in real-time:

```
✓ Starting Deep Research...
✓ Interaction ID: interactions/abc123...
✓ AI: Researching address verification
✓ AI: Analyzing geographic risks
✓ Deadline exceeded - Resuming stream...
✓ AI: Generating recommendations
✓ Research completed!
```

### Automatic Console Logging

When research starts, the interaction ID is automatically logged:

```
=== Deep Research Started ===
Lead ID: 1
Interaction ID: interactions/abc123def456
=============================
```

### Auto-Resume on Deadline

If the stream times out with `deadline_exceeded`, it automatically resumes:

```
=== Resuming Stream ===
Interaction ID: interactions/abc123def456
=======================
```

### Status Badges

Visual status indicators:
- **IDLE** - Gray - Ready to start
- **STARTING** - Blue with spinner - Initializing
- **RESEARCHING** - Blue with spinner - Active research
- **RESUMING** - Orange with pulse - Recovering from timeout
- **COMPLETED** - Green with checkmark - Finished
- **FAILED** - Red with X - Error occurred

### Actions Available

**During Research:**
- Stop button - Cancel ongoing research

**After Completion:**
- Copy button - Copy report to clipboard
- Download button - Save report as Markdown file

---

## Backend Integration

The component connects to these backend endpoints:

```typescript
const DEEP_RESEARCH_API = 'http://localhost:7104/deep-research';

// Streaming endpoint (SSE)
GET /stream/{leadId}

// Status endpoint
GET /status/{interactionId}

// History endpoint
GET /interactions/{leadId}
```

### Environment Configuration

Update your environment variables if needed:

```env
# .env.local
VITE_DEEP_RESEARCH_API_URL=http://localhost:7104/deep-research
```

Then update the component:

```typescript
const DEEP_RESEARCH_API = import.meta.env.VITE_DEEP_RESEARCH_API_URL || 'http://localhost:7104/deep-research';
```

---

## Customization

### Custom Message Display

Modify the message rendering in `DeepResearchDialog.tsx`:

```typescript
{research.messages.map((msg, idx) => (
    <div key={idx} className="custom-message-class">
        {/* Your custom message UI */}
        {msg.content}
    </div>
))}
```

### Custom Status Colors

Update the `getStatusColor()` function:

```typescript
const getStatusColor = () => {
    switch (research.status) {
        case 'researching':
            return 'purple'; // Change to your brand color
        // ... other cases
    }
};
```

### Add Custom Events

Listen to additional SSE events:

```typescript
eventSource.addEventListener('custom_event', (e) => {
    const data = JSON.parse(e.data);
    // Handle custom event
    addMessage('custom', data.message);
});
```

---

## Error Handling

The component handles these error scenarios:

1. **Connection Lost** - Shows error message and stops
2. **Research Failed** - Displays error from backend
3. **Deadline Exceeded** - Automatically resumes (no user action needed)
4. **Invalid Lead** - Backend returns 404

Error display:

```tsx
{research.error && (
    <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{research.error}</AlertDescription>
    </Alert>
)}
```

---

## Performance Tips

### Memory Management

The component automatically cleans up:
- Closes EventSource on unmount
- Clears references on dialog close
- Stops streaming when user closes dialog

### Prevent Multiple Streams

Only one research can run at a time per dialog instance. The UI disables the start button during research.

---

## Testing

### Manual Testing

1. Click "AI Deep Research" button
2. Verify console logs interaction ID
3. Watch real-time messages
4. Wait for completion (5-20 minutes)
5. Test copy and download buttons

### Test Error Scenarios

```typescript
// Simulate connection error
eventSource.close();

// Simulate deadline exceeded
// Backend will handle automatically
```

---

## Complete Example

Here's a full integration example:

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeepResearchButton } from '@/features/admin/components/deep-research';
import { PropertyLeadDto } from '@/features/admin/services/leadService';

interface LeadCardProps {
    lead: PropertyLeadDto;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead #{lead.id}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Lead Information */}
                    <div>
                        <p className="text-sm text-muted-foreground">Status: {lead.status}</p>
                        <p className="text-sm text-muted-foreground">Zip Code: {lead.zipCode}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline">View Details</Button>
                        <Button variant="outline">Generate Quote</Button>
                        
                        {/* Deep Research Button */}
                        <DeepResearchButton lead={lead} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
```

---

## Troubleshooting

### Issue: Button doesn't appear

**Check:**
- Import path is correct
- `lead` prop is provided
- Component is inside a React component tree

### Issue: No connection to backend

**Check:**
- Backend is running on port 7104
- CORS is enabled on backend
- API URL is correct
- No network firewall blocking

### Issue: Stream stops immediately

**Check:**
- Backend logs for errors
- Gemini API key is configured
- Lead ID exists in database

### Issue: No console logs

**Check:**
- Browser console is open
- Console level includes "Log" and "Info"
- JavaScript is enabled

---

## Browser Compatibility

Requires browsers supporting:
- Server-Sent Events (SSE)
- EventSource API
- Modern JavaScript (ES2020+)

Supported browsers:
- ✅ Chrome 87+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

---

## Security Considerations

### CORS Configuration

Backend must allow CORS from your frontend domain:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/deep-research/**")
                    .allowedOrigins("http://localhost:5173") // Your frontend URL
                    .allowedMethods("GET", "POST")
                    .allowCredentials(false);
            }
        };
    }
}
```

### API Authentication

If you add authentication:

```typescript
const eventSource = new EventSource(`${DEEP_RESEARCH_API}/stream/${lead.id}`, {
    withCredentials: true
});
```

---

## Next Steps

1. ✅ Import `DeepResearchButton` component
2. ✅ Add button to your UI where you have access to `PropertyLeadDto`
3. ✅ Test with a sample lead
4. ✅ Customize styling to match your design system
5. ✅ Add to other pages as needed

---

## Support

For issues or questions:
- Check backend logs: `tail -f logs/application.log`
- Check browser console for errors
- Verify all services are running
- Review backend README.md

---

**Ready to use!** Just import and add `<DeepResearchButton lead={lead} />` to your components.
