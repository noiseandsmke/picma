export interface District {
    name: string;
    wards: string[];
}

export interface City {
    name: string;
    zipCode: string;
    districts: District[];
}

export const VN_LOCATIONS: City[] = [
    {
        name: "Hà Nội",
        zipCode: "100000",
        districts: [
            {
                name: "Đống Đa",
                wards: ["Cát Linh", "Hàng Bột", "Láng Hạ", "Láng Thượng", "Kim Liên", "Khâm Thiên"]
            },
            {
                name: "Ba Đình",
                wards: ["Cống Vị", "Điện Biên", "Đội Cấn", "Giảng Võ", "Kim Mã", "Liễu Giai"]
            },
            {
                name: "Hoàn Kiếm",
                wards: ["Chương Dương", "Cửa Đông", "Cửa Nam", "Đồng Xuân", "Hàng Bạc", "Hàng Bài"]
            }
        ]
    },
    {
        name: "Hồ Chí Minh",
        zipCode: "700000",
        districts: [
            {
                name: "Quận 1",
                wards: ["Bến Nghé", "Bến Thành", "Cô Giang", "Cầu Kho", "Cầu Ông Lãnh"]
            },
            {
                name: "Quận 3",
                wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5"]
            }
        ]
    }
];