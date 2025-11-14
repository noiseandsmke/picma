package edu.hcmute.repo;

import edu.hcmute.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserAddressRepo extends JpaRepository<UserAddress, Integer> {
    List<UserAddress> findByZipCode(@Param("zipCode") String zipCode);
}