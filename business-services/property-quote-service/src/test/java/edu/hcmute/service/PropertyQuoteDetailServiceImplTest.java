package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDetailDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.entity.PropertyLeadDetail;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.entity.PropertyQuoteDetail;
import edu.hcmute.event.PropertyLeadProducer;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyLeadDetailRepo;
import edu.hcmute.repo.PropertyLeadRepo;
import edu.hcmute.repo.PropertyQuoteDetailRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteDetailServiceImplTest {

    @Mock
    private PropertyQuoteDetailRepo propertyQuoteDetailRepo;
    @Mock
    private PropertyLeadRepo propertyLeadRepo;
    @Mock
    private PropertyLeadDetailRepo propertyLeadDetailRepo;
    @Mock
    private PropertyLeadProducer leadProducer;
    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PropertyQuoteDetailServiceImpl propertyQuoteDetailService;

    @Test
    void createPropertyQuoteDetail_success() {
        PropertyQuoteDetailDto inputDto = new PropertyQuoteDetailDto(null, null, null, null, null);

        PropertyQuote quote = new PropertyQuote();
        quote.setUserInfo("u1");
        quote.setPropertyInfo("p1");

        PropertyQuoteDetail detail = new PropertyQuoteDetail();
        detail.setPropertyQuote(quote);

        when(propertyQuoteMapper.toEntity(inputDto)).thenReturn(detail);
        when(propertyQuoteDetailRepo.save(detail)).thenReturn(detail);

        when(propertyLeadRepo.save(any(PropertyLead.class))).thenAnswer(inv -> {
            PropertyLead l = inv.getArgument(0);
            l.setId(1);
            return l;
        });

        when(propertyLeadDetailRepo.save(any(PropertyLeadDetail.class))).thenAnswer(inv -> {
            PropertyLeadDetail d = inv.getArgument(0);
            d.setId(1);
            return d;
        });

        when(leadProducer.produceLead(any(PropertyLead.class))).thenReturn(true);
        when(propertyQuoteMapper.toDto(detail)).thenReturn(new PropertyQuoteDetailDto(1, null, null, null, null));

        PropertyQuoteDetailDto result = propertyQuoteDetailService.createPropertyQuoteDetail(inputDto);

        assertNotNull(result);
        verify(propertyQuoteDetailRepo).save(detail);
        verify(propertyLeadRepo).save(any(PropertyLead.class));
        verify(propertyLeadDetailRepo).save(any(PropertyLeadDetail.class));
        verify(leadProducer).produceLead(any(PropertyLead.class));
    }

    @Test
    void getPropertyQuoteDetailById_success() {
        Integer id = 1;
        PropertyQuoteDetail detail = new PropertyQuoteDetail();
        when(propertyQuoteDetailRepo.findById(id)).thenReturn(Optional.of(detail));
        when(propertyQuoteMapper.toDto(detail)).thenReturn(new PropertyQuoteDetailDto(id, null, null, null, null));

        PropertyQuoteDetailDto result = propertyQuoteDetailService.getPropertyQuoteDetailById(id);

        assertNotNull(result);
        assertEquals(id, result.id());
    }

    @Test
    void getPropertyQuoteDetailById_notFound() {
        Integer id = 1;
        when(propertyQuoteDetailRepo.findById(id)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> propertyQuoteDetailService.getPropertyQuoteDetailById(id));
    }

    @Test
    void getAllPropertyQuoteDetail_success() {
        PropertyQuoteDetail detail = new PropertyQuoteDetail();
        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        when(propertyQuoteDetailRepo.findAll(sort)).thenReturn(Collections.singletonList(detail));
        when(propertyQuoteMapper.toDto(detail)).thenReturn(new PropertyQuoteDetailDto(1, null, null, null, null));

        List<PropertyQuoteDetailDto> result = propertyQuoteDetailService.getAllPropertyQuoteDetail("id", "asc");

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getAllPropertyQuoteDetail_empty() {
        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        when(propertyQuoteDetailRepo.findAll(sort)).thenReturn(Collections.emptyList());
        assertThrows(RuntimeException.class, () -> propertyQuoteDetailService.getAllPropertyQuoteDetail("id", "asc"));
    }

    @Test
    void updatePropertyQuoteDetail_success() {
        Integer id = 1;
        PropertyQuoteDetailDto inputDto = new PropertyQuoteDetailDto(id, null, null, null, null);
        PropertyQuoteDetail existingDetail = new PropertyQuoteDetail();
        existingDetail.setPropertyQuote(new PropertyQuote());

        when(propertyQuoteDetailRepo.findById(id)).thenReturn(Optional.of(existingDetail));
        when(propertyQuoteMapper.toEntity(inputDto)).thenReturn(existingDetail);
        when(propertyQuoteDetailRepo.save(existingDetail)).thenReturn(existingDetail);
        when(propertyQuoteMapper.toDto(existingDetail)).thenReturn(inputDto);

        PropertyQuoteDetailDto result = propertyQuoteDetailService.updatePropertyQuoteDetail(id, inputDto);

        assertNotNull(result);
        assertEquals(id, result.id());
    }

    @Test
    void deletePropertyQuoteDetailById_success() {
        Integer id = 1;
        when(propertyQuoteDetailRepo.existsById(id)).thenReturn(true);
        propertyQuoteDetailService.deletePropertyQuoteDetailById(id);
        verify(propertyQuoteDetailRepo).deleteById(id);
    }
}