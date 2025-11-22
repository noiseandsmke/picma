package edu.hcmute.mapper;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationDto toDto(Notification notification);

    Notification toEntity(NotificationDto notificationDto);
}